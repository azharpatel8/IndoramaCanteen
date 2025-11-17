import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../db/oracleConnection.js';

const router = express.Router();

router.post(
  '/',
  [body('items').isArray({ min: 1 }), body('special_instructions').optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items, special_instructions } = req.body;
      const user_id = req.user.user_id;
      const connection = await req.pool.getConnection();

      try {
        await connection.execute('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        let totalAmount = 0;
        const itemDetails = [];

        for (const item of items) {
          const itemResult = await connection.execute(
            'SELECT price, available_quantity FROM menu_items WHERE item_id = :item_id AND is_available = 1',
            { item_id: item.item_id }
          );

          if (!itemResult.rows || itemResult.rows.length === 0) {
            return res.status(400).json({ error: `Item ${item.item_id} not available` });
          }

          const [price, available_quantity] = itemResult.rows[0];
          if (available_quantity < item.quantity) {
            return res.status(400).json({ error: `Insufficient quantity for item ${item.item_id}` });
          }

          const subtotal = price * item.quantity;
          totalAmount += subtotal;
          itemDetails.push({
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: price,
            subtotal,
          });
        }

        const orderResult = await connection.execute(
          `INSERT INTO orders (order_id, user_id, status, total_amount, special_instructions)
           VALUES (orders_seq.NEXTVAL, :user_id, :status, :total_amount, :special_instructions)
           RETURNING order_id INTO :order_id`,
          {
            user_id,
            status: 'pending',
            total_amount: totalAmount,
            special_instructions: special_instructions || null,
            order_id: { dir: 3001, type: 1 },
          }
        );

        const orderId = orderResult.outBinds.order_id[0];

        for (const detail of itemDetails) {
          await connection.execute(
            `INSERT INTO order_items (order_item_id, order_id, item_id, quantity, unit_price, subtotal)
             VALUES (order_items_seq.NEXTVAL, :order_id, :item_id, :quantity, :unit_price, :subtotal)`,
            {
              order_id: orderId,
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
            }
          );
        }

        await connection.commit();
        res.status(201).json({ order_id: orderId, total_amount: totalAmount, status: 'pending' });
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

router.get('/', async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const connection = await req.pool.getConnection();

    try {
      const result = await connection.execute(
        `SELECT order_id, order_date, status, total_amount, delivery_date, special_instructions
         FROM orders WHERE user_id = :user_id ORDER BY order_date DESC`,
        { user_id }
      );

      const orders = result.rows.map((row) => ({
        order_id: row[0],
        order_date: row[1],
        status: row[2],
        total_amount: row[3],
        delivery_date: row[4],
        special_instructions: row[5],
      }));

      res.json(orders);
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const connection = await req.pool.getConnection();

    try {
      const orderResult = await connection.execute(
        `SELECT order_id, order_date, status, total_amount, delivery_date, special_instructions
         FROM orders WHERE order_id = :id AND user_id = :user_id`,
        { id, user_id }
      );

      if (!orderResult.rows || orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const [order_id, order_date, status, total_amount, delivery_date, special_instructions] = orderResult.rows[0];

      const itemsResult = await connection.execute(
        `SELECT order_item_id, item_id, quantity, unit_price, subtotal
         FROM order_items WHERE order_id = :order_id`,
        { order_id }
      );

      const items = itemsResult.rows.map((row) => ({
        order_item_id: row[0],
        item_id: row[1],
        quantity: row[2],
        unit_price: row[3],
        subtotal: row[4],
      }));

      res.json({
        order_id,
        order_date,
        status,
        total_amount,
        delivery_date,
        special_instructions,
        items,
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id/cancel',
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const connection = await req.pool.getConnection();

      try {
        const orderResult = await connection.execute(
          'SELECT status FROM orders WHERE order_id = :id AND user_id = :user_id',
          { id, user_id }
        );

        if (!orderResult.rows || orderResult.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const [status] = orderResult.rows[0];
        if (status !== 'pending') {
          return res.status(400).json({ error: 'Can only cancel pending orders' });
        }

        await connection.execute('UPDATE orders SET status = :status WHERE order_id = :id', {
          status: 'cancelled',
          id,
        });

        await connection.commit();
        res.json({ message: 'Order cancelled successfully' });
      } finally {
        await connection.close();
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
