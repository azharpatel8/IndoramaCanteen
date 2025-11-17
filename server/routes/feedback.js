import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../db/oracleConnection.js';

const router = express.Router();

router.post(
  '/',
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('category').notEmpty(),
    body('comment').optional().isString(),
    body('order_id').optional().isInt(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, category, comment, order_id } = req.body;
      const user_id = req.user.user_id;
      const connection = await req.pool.getConnection();

      try {
        const result = await connection.execute(
          `INSERT INTO feedback (feedback_id, user_id, order_id, rating, category, comment)
           VALUES (feedback_seq.NEXTVAL, :user_id, :order_id, :rating, :category, :comment)
           RETURNING feedback_id INTO :feedback_id`,
          {
            user_id,
            order_id: order_id || null,
            rating,
            category,
            comment: comment || null,
            feedback_id: { dir: 3001, type: 1 },
          }
        );

        await connection.commit();

        res.status(201).json({
          feedback_id: result.outBinds.feedback_id[0],
          message: 'Feedback submitted successfully',
        });
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
        `SELECT feedback_id, order_id, rating, category, comment, created_at
         FROM feedback WHERE user_id = :user_id ORDER BY created_at DESC`,
        { user_id }
      );

      const feedbacks = result.rows.map((row) => ({
        feedback_id: row[0],
        order_id: row[1],
        rating: row[2],
        category: row[3],
        comment: row[4],
        created_at: row[5],
      }));

      res.json(feedbacks);
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { category } = req.params;
    const connection = await req.pool.getConnection();

    try {
      const result = await connection.execute(
        `SELECT feedback_id, order_id, rating, category, comment, created_at
         FROM feedback WHERE user_id = :user_id AND category = :category ORDER BY created_at DESC`,
        { user_id, category }
      );

      const feedbacks = result.rows.map((row) => ({
        feedback_id: row[0],
        order_id: row[1],
        rating: row[2],
        category: row[3],
        comment: row[4],
        created_at: row[5],
      }));

      res.json(feedbacks);
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
