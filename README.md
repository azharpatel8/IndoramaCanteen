# Indorama Canteen Web App

A modern web application for managing canteen operations with Oracle Database backend integration. This application handles menu display, order management, billing, and user feedback for the Indorama canteen.

## Architecture Overview

```
Frontend (React + Vite)
        ↓
  Express API Layer
        ↓
  Connection Pool
        ↓
  Oracle Database
```

## Features

- **User Authentication**: Secure login/registration with JWT tokens
- **Menu Management**: Browse menu items by category
- **Order Management**: Create, view, and cancel orders
- **Billing System**: Process payments and generate bills
- **User Feedback**: Submit ratings and reviews
- **Connection Pooling**: Efficient Oracle database connection management
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Authentication middleware, password hashing, secure API endpoints

## Prerequisites

- Node.js 16+ and npm
- Oracle Database 11g+ or later
- Oracle Database drivers (oracledb npm package handles this)

## Project Structure

```
project/
├── server/
│   ├── index.js                 # Express app entry point
│   ├── db/
│   │   ├── oracleConnection.js  # Oracle connection pool setup
│   │   └── schema.sql           # Database schema and tables
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Global error handling
│   └── routes/
│       ├── auth.js              # Authentication endpoints
│       ├── menu.js              # Menu endpoints
│       ├── orders.js            # Order management endpoints
│       ├── billing.js           # Billing endpoints
│       └── feedback.js          # Feedback endpoints
├── src/
│   ├── components/              # React components
│   ├── services/                # API service layer
│   ├── App.jsx                  # Main App component
│   └── index.css                # Global styles
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
└── .env                         # Environment variables
```

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Oracle Database Connection

Edit `.env` file with your Oracle database credentials:

```env
ORACLE_USER=your_oracle_username
ORACLE_PASSWORD=your_oracle_password
ORACLE_CONNECT_STRING=hostname:port/SERVICE_NAME
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10
JWT_SECRET=your_secure_jwt_secret_key
```

**Connection String Examples:**
- Local: `localhost:1521/ORCL`
- Remote: `oracle.example.com:1521/PROD`
- Oracle Cloud: `adb.region.oraclecloud.com:1522/service_name`

### 3. Create Database Schema

Connect to your Oracle database and run the schema script:

```bash
sqlplus username/password@database_name

SQL> @server/db/schema.sql
```

Or use Oracle SQL Developer to execute the script.

### 4. Seed Sample Data (Optional)

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
COMMIT;
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers concurrently:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

### Production Build

```bash
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "department": "Engineering"
}

Response: 201 Created
{
  "message": "User registered successfully"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "role": "employee",
    "email": "john@example.com"
  }
}
```

### Menu Endpoints

#### Get All Menu Items
```
GET /api/menu

Response: 200 OK
[
  {
    "item_id": 1,
    "name": "Paneer Tikka",
    "description": "Grilled paneer",
    "category": "Main Course",
    "price": 250.00,
    "available_quantity": 50,
    "is_available": true,
    "image_url": "https://..."
  }
]
```

#### Get by Category
```
GET /api/menu/category/Main%20Course

Response: 200 OK
[...items in category...]
```

### Order Endpoints

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {"item_id": 1, "quantity": 2},
    {"item_id": 3, "quantity": 1}
  ],
  "special_instructions": "Extra spicy, no onions"
}

Response: 201 Created
{
  "order_id": 101,
  "total_amount": 520.00,
  "status": "pending"
}
```

#### Get All Orders
```
GET /api/orders
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "order_id": 101,
    "order_date": "2024-01-15T10:30:00",
    "status": "confirmed",
    "total_amount": 520.00,
    "delivery_date": "2024-01-15T12:00:00",
    "special_instructions": "Extra spicy"
  }
]
```

#### Cancel Order
```
PUT /api/orders/:order_id/cancel
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Order cancelled successfully"
}
```

### Billing Endpoints

#### Create Bill (Process Payment)
```
POST /api/billing
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 101,
  "payment_method": "card",
  "transaction_id": "TXN-1234567890"
}

Response: 201 Created
{
  "bill_id": 1,
  "amount": 520.00,
  "payment_status": "completed",
  "message": "Payment processed successfully"
}
```

#### Get Bills
```
GET /api/billing
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "bill_id": 1,
    "order_id": 101,
    "amount": 520.00,
    "payment_method": "card",
    "payment_status": "completed",
    "created_at": "2024-01-15T10:35:00"
  }
]
```

### Feedback Endpoints

#### Submit Feedback
```
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "category": "food_quality",
  "comment": "Excellent food quality!",
  "order_id": 101
}

Response: 201 Created
{
  "feedback_id": 1,
  "message": "Feedback submitted successfully"
}
```

#### Get Feedback
```
GET /api/feedback
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "feedback_id": 1,
    "order_id": 101,
    "rating": 5,
    "category": "food_quality",
    "comment": "Excellent food quality!",
    "created_at": "2024-01-15T10:40:00"
  }
]
```

## Database Tables

### users
- user_id (PK)
- username
- email
- password_hash
- full_name
- role
- department
- phone
- is_active
- created_at
- updated_at

### menu_items
- item_id (PK)
- name
- description
- category
- price
- available_quantity
- is_available
- image_url
- created_at
- updated_at

### orders
- order_id (PK)
- user_id (FK)
- order_date
- status
- total_amount
- delivery_date
- special_instructions
- created_at
- updated_at

### order_items
- order_item_id (PK)
- order_id (FK)
- item_id (FK)
- quantity
- unit_price
- subtotal
- created_at

### billing
- bill_id (PK)
- order_id (FK)
- user_id (FK)
- amount
- payment_method
- payment_status
- transaction_id
- paid_at
- created_at
- updated_at

### feedback
- feedback_id (PK)
- user_id (FK)
- order_id (FK)
- rating
- comment
- category
- created_at

## Security Features

1. **JWT Authentication**: All protected endpoints require valid JWT tokens
2. **Password Hashing**: Passwords are hashed using bcrypt before storage
3. **Connection Pooling**: Efficient connection management prevents resource exhaustion
4. **Input Validation**: Express-validator validates all user inputs
5. **Error Handling**: Sensitive error details are not exposed to clients
6. **CORS**: Configured for secure cross-origin requests

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Performance Optimization

- **Connection Pooling**: Database connections are reused from a pool
- **Indexes**: Database indexes on frequently queried columns
- **Caching**: Frontend caches API responses in memory
- **Pagination**: Large result sets can be paginated
- **Query Optimization**: SQL queries use appropriate WHERE clauses and JOINs

## Troubleshooting

### Oracle Connection Failed
- Verify Oracle database is running
- Check ORACLE_CONNECT_STRING format
- Ensure credentials are correct
- Verify firewall allows connection to Oracle port

### JWT Token Expired
- Token expires after 24 hours
- User needs to login again to get new token
- Token is stored in localStorage

### Menu Items Not Displaying
- Check menu items exist in database
- Verify is_available column is set to 1
- Check API response for errors in console

### Payment Processing Failed
- Verify order exists and is in 'pending' status
- Check user_id matches authenticated user
- Ensure sufficient data in order

## Deployment

### Heroku Deployment

1. Create `.env.production` with production credentials
2. Push to Heroku: `git push heroku main`
3. Set environment variables: `heroku config:set ORACLE_USER=...`

### Docker Deployment

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server ./server
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Support and Documentation

- Oracle Database Docs: https://docs.oracle.com/
- Oracledb Driver: https://github.com/oracle/node-oracledb
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/

## License

This project is confidential and proprietary to Indorama.