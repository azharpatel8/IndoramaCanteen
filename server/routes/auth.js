import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../db/oracleConnection.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('username').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').notEmpty().trim(),
    body('department').notEmpty().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, full_name, department } = req.body;
      const connection = await getConnection();

      try {
        const existingUser = await connection.execute(
          'SELECT user_id FROM users WHERE username = :username OR email = :email',
          { username, email }
        );

        if (existingUser.rows && existingUser.rows.length > 0) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await connection.execute(
          `INSERT INTO users (user_id, username, email, password_hash, full_name, department, role)
           VALUES (users_seq.NEXTVAL, :username, :email, :password_hash, :full_name, :department, :role)
           RETURNING user_id INTO :user_id`,
          {
            username,
            email,
            password_hash: hashedPassword,
            full_name,
            department,
            role: 'employee',
            user_id: { dir: 3001, type: 1 },
          }
        );

        await connection.commit();

        res.status(201).json({ message: 'User registered successfully' });
      } finally {
        await connection.close();
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [body('username').notEmpty(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const connection = await getConnection();

      try {
        const result = await connection.execute(
          'SELECT user_id, password_hash, role, email FROM users WHERE username = :username AND is_active = 1',
          { username }
        );

        if (!result.rows || result.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const [userId, passwordHash, role, email] = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, passwordHash);

        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { user_id: userId, username, role, email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({ token, user: { user_id: userId, username, role, email } });
      } finally {
        await connection.close();
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
