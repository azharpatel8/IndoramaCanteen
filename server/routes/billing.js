import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../db/oracleConnection.js';

const router = express.Router();

router.post(
  '/',
  [
    body('order_id').isInt(),
    body('payment_method').notEmpty(),
    body('transaction_id').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { order_id, payment_method, transaction_id } = req.body;
      const user_id = req.user.user_id;
      const connection = await req.pool.getConnection();

      try {
        const orderResult = await connection.execute(
          'SELECT total_amount, status FROM orders WHERE order_id = :order_id AND user_id = :user_id',
          { order_id, user_id }
        );

        if (!orderResult.rows || orderResult.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const [amount, order_status] = orderResult.rows[0];

        if (order_status !== 'pending') {
          return res.status(400).json({ error: 'Order is not available for payment' });
        }

        const billResult = await connection.execute(
          `INSERT INTO billing (bill_id, order_id, user_id, amount, payment_method, payment_status, transaction_id)
           VALUES (billing_seq.NEXTVAL, :order_id, :user_id, :amount, :payment_method, :payment_status, :transaction_id)
           RETURNING bill_id INTO :bill_id`,
          {
            order_id,
            user_id,
            amount,
            payment_method,
            payment_status: 'completed',
            transaction_id: transaction_id || null,
            bill_id: { dir: 3001, type: 1 },
          }
        );

        await connection.execute('UPDATE orders SET status = :status WHERE order_id = :order_id', {
          status: 'confirmed',
          order_id,
        });

        await connection.commit();

        res.status(201).json({
          bill_id: billResult.outBinds.bill_id[0],
          amount,
          payment_status: 'completed',
          message: 'Payment processed successfully',
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        await connection.close();
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:bill_id', async (req, res, next) => {
  try {
    const { bill_id } = req.params;
    const user_id = req.user.user_id;
    const connection = await req.pool.getConnection();

    try {
      const result = await connection.execute(
        `SELECT bill_id, order_id, amount, payment_method, payment_status, transaction_id, paid_at, created_at
         FROM billing WHERE bill_id = :bill_id AND user_id = :user_id`,
        { bill_id, user_id }
      );

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      const [id, order_id, amount, payment_method, payment_status, transaction_id, paid_at, created_at] =
        result.rows[0];

      res.json({
        bill_id: id,
        order_id,
        amount,
        payment_method,
        payment_status,
        transaction_id,
        paid_at,
        created_at,
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const connection = await req.pool.getConnection();

    try {
      const result = await connection.execute(
        `SELECT bill_id, order_id, amount, payment_method, payment_status, created_at
         FROM billing WHERE user_id = :user_id ORDER BY created_at DESC`,
        { user_id }
      );

      const bills = result.rows.map((row) => ({
        bill_id: row[0],
        order_id: row[1],
        amount: row[2],
        payment_method: row[3],
        payment_status: row[4],
        created_at: row[5],
      }));

      res.json(bills);
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
