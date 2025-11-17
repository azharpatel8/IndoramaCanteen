import express from 'express';
import { getConnection } from '../db/oracleConnection.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const connection = await req.pool.getConnection();
    try {
      const result = await connection.execute(
        `SELECT item_id, name, description, category, price, available_quantity, is_available, image_url
         FROM menu_items WHERE is_available = 1 ORDER BY category, name`
      );

      const items = result.rows.map((row) => ({
        item_id: row[0],
        name: row[1],
        description: row[2],
        category: row[3],
        price: row[4],
        available_quantity: row[5],
        is_available: row[6] === 1,
        image_url: row[7],
      }));

      res.json(items);
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
    const connection = await req.pool.getConnection();
    try {
      const result = await connection.execute(
        `SELECT item_id, name, description, category, price, available_quantity, is_available, image_url
         FROM menu_items WHERE item_id = :id`,
        { id }
      );

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      const [item_id, name, description, category, price, available_quantity, is_available, image_url] = result.rows[0];
      res.json({
        item_id,
        name,
        description,
        category,
        price,
        available_quantity,
        is_available: is_available === 1,
        image_url,
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const connection = await req.pool.getConnection();
    try {
      const result = await connection.execute(
        `SELECT item_id, name, description, category, price, available_quantity, is_available, image_url
         FROM menu_items WHERE category = :category AND is_available = 1 ORDER BY name`,
        { category }
      );

      const items = result.rows.map((row) => ({
        item_id: row[0],
        name: row[1],
        description: row[2],
        category: row[3],
        price: row[4],
        available_quantity: row[5],
        is_available: row[6] === 1,
        image_url: row[7],
      }));

      res.json(items);
    } finally {
      await connection.close();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
