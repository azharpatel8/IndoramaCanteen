# Quick Start Guide - Indorama Canteen Web App

## Overview
This is a complete canteen management system with Oracle Database backend, Express API, and React frontend.

## Prerequisites
- Node.js 16+ and npm
- Oracle Database 11g or higher
- Oracle SQL*Plus or SQL Developer (for running schema)

## 1. Setup Oracle Database

### Step 1: Create User (if needed)
```sql
CREATE USER canteen_user IDENTIFIED BY canteen_password;
GRANT CONNECT, RESOURCE TO canteen_user;
GRANT UNLIMITED TABLESPACE TO canteen_user;
```

### Step 2: Run Schema Script
Connect as the canteen user and execute the schema:
```bash
sqlplus canteen_user/canteen_password@localhost:1521/ORCL
SQL> @server/db/schema.sql
SQL> EXIT;
```

### Step 3: Add Sample Data (Optional)
```sql
INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Paneer Tikka',
  'Grilled paneer with yogurt marinade',
  'Main Course',
  250.00,
  50,
  1,
  NULL,
  SYSTIMESTAMP,
  SYSTIMESTAMP
);
INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Butter Chicken',
  'Creamy chicken curry',
  'Main Course',
  300.00,
  50,
  1,
  NULL,
  SYSTIMESTAMP,
  SYSTIMESTAMP
);
INSERT INTO menu_items VALUES (
  menu_items_seq.NEXTVAL,
  'Masala Chai',
  'Traditional Indian spiced tea',
  'Beverages',
  50.00,
  100,
  1,
  NULL,
  SYSTIMESTAMP,
  SYSTIMESTAMP
);
COMMIT;
```

## 2. Configure Environment

Create/update `.env` file:
```env
VITE_API_URL=http://localhost:3001/api

PORT=3001
NODE_ENV=development

ORACLE_USER=canteen_user
ORACLE_PASSWORD=canteen_password
ORACLE_CONNECT_STRING=localhost:1521/ORCL

ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10

JWT_SECRET=your_super_secret_key_123_change_this_in_production
```

## 3. Install Dependencies

```bash
npm install --production=false
```

## 4. Run Application

### Development Mode (Backend + Frontend)
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

### Production Build
```bash
npm run build
npm start
```

## 5. Test the Application

### Register a User
1. Open http://localhost:5173
2. Click "Register here"
3. Fill in the form:
   - Username: john_doe
   - Email: john@example.com
   - Password: test123456
   - Full Name: John Doe
   - Department: Engineering
4. Click Register

### Login
1. Use your registered credentials
2. You'll be logged in

### Place an Order
1. Click on Menu tab
2. Select items and add to cart
3. Fill special instructions (optional)
4. Choose payment method
5. Click "Place Order"

### View Orders
1. Click "Orders" tab
2. See all your orders with status

### Leave Feedback
1. Click "Feedback" tab
2. Click "Submit Feedback"
3. Rate and comment
4. Click Submit

## 6. API Endpoints Reference

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Menu
- `GET /api/menu` - Get all items
- `GET /api/menu/:id` - Get item by ID
- `GET /api/menu/category/:category` - Get by category

### Orders
- `POST /api/orders` - Create order (requires token)
- `GET /api/orders` - Get user orders (requires token)
- `GET /api/orders/:id` - Get order details (requires token)
- `PUT /api/orders/:id/cancel` - Cancel order (requires token)

### Billing
- `POST /api/billing` - Create bill/payment (requires token)
- `GET /api/billing` - Get bills (requires token)
- `GET /api/billing/:id` - Get bill details (requires token)

### Feedback
- `POST /api/feedback` - Submit feedback (requires token)
- `GET /api/feedback` - Get feedback (requires token)
- `GET /api/feedback/category/:category` - Get by category (requires token)

## 7. Troubleshooting

### Oracle Connection Error
- Verify Oracle is running: `lsnrctl status`
- Check credentials in .env
- Test connection: `sqlplus canteen_user/canteen_password@localhost:1521/ORCL`

### Port Already in Use
```bash
# Frontend (5173)
lsof -i :5173
kill -9 <PID>

# Backend (3001)
lsof -i :3001
kill -9 <PID>
```

### Schema Not Found
- Verify you ran `@server/db/schema.sql`
- Check that user has CREATE TABLE permissions
- Run: `SELECT table_name FROM user_tables;`

### JWT Token Errors
- Token expires after 24 hours
- User needs to login again
- Clear browser localStorage if issues persist

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --production=false
npm run build
```

## 8. Project Structure

```
project/
├── server/                 # Express backend
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── db/                # Oracle connection
│   └── index.js           # Server entry
├── src/                   # React frontend
│   ├── components/        # UI components
│   ├── services/          # API client
│   ├── App.jsx            # Main app
│   └── index.css          # Styles
├── package.json           # Dependencies
├── .env                   # Configuration
└── vite.config.js         # Vite config
```

## 9. Key Features

✓ User Authentication with JWT
✓ Menu Management with Categories
✓ Order Creation & Management
✓ Payment Processing
✓ User Feedback & Ratings
✓ Connection Pooling for Performance
✓ Input Validation & Error Handling
✓ Responsive Design
✓ Secure API Layer

## 10. Support

For issues:
1. Check console logs: Browser DevTools (F12)
2. Check backend logs: Terminal running npm run dev
3. Verify Oracle database: sqlplus connection
4. Review README.md for detailed documentation

## Production Deployment

1. Update .env with production values
2. Generate strong JWT_SECRET
3. Use environment variables, not .env file
4. Enable HTTPS
5. Use connection pool with appropriate min/max
6. Set NODE_ENV=production
7. Use process manager (PM2)

```bash
npm install -g pm2
pm2 start server/index.js --name "canteen-api"
```

---

Enjoy using Indorama Canteen Web App!
