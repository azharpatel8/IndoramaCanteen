# Oracle ORDS Migration Guide

This guide explains the migration from Supabase to Oracle Autonomous Database using ORDS REST endpoints.

## What Changed

### Backend Architecture
- **Before**: Supabase client making direct PostgreSQL queries
- **After**: Node.js/Express backend calling Oracle ORDS REST APIs

### Frontend
- **No changes required** - Frontend continues to work with the same API structure

## New Backend Structure

```
server/
├── db/
│   └── oracleApiClient.ts       # Oracle ORDS HTTP client with Basic Auth
├── services/
│   ├── profileService.ts        # Profile CRUD operations
│   ├── orderService.ts          # Orders & order items
│   ├── menuService.ts           # Menu items, daily menu, meal sessions
│   ├── partyOrderService.ts     # Party orders
│   └── inventoryService.ts      # Ingredients, stock, deductions, logs
└── routes/
    ├── auth.ts                  # Authentication endpoints
    ├── orders.ts                # Order management endpoints
    └── menu.ts                  # Menu management endpoints
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **Backend**: `express`, `axios`, `cors`, `dotenv`, `jsonwebtoken`, `uuid`
- **Dev Tools**: TypeScript types, `ts-node`, `nodemon`, `concurrently`

### 2. Configure Environment Variables

Copy `env.template` to `.env`:

```bash
cp env.template .env
```

Or manually create a `.env` file using the `env.template` as a reference.

Update `.env` with your Oracle ORDS credentials:

```env
# Oracle ORDS Configuration
ORACLE_ORDS_BASE_URL=https://ge1b5fe67bdca57-indoramadbdev.adb.eu-amsterdam-1.oraclecloudapps.com/ords/xxindo
ORACLE_ORDS_USER=xxindo
ORACLE_ORDS_PASSWORD=your_actual_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_strong_random_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Run the Application

**Development mode** (runs both frontend and backend):

```bash
npm run dev:all
```

**Or run separately:**

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run server:dev
```

Production build:
```bash
npm run build
npm run server
```

## Oracle ORDS API Client

The `oracleApiClient.ts` module handles all Oracle ORDS communication:

```typescript
import oracleClient from './db/oracleApiClient';

// POST request
await oracleClient.post('profiles/', data);

// GET request
await oracleClient.get('orders/', { user_id: '123' });

// PUT request
await oracleClient.put('orders/456', { status: 'completed' });

// DELETE request
await oracleClient.delete('menu_items/789');
```

### Features:
- ✅ Basic Authentication (automatically injected)
- ✅ Error handling and retries
- ✅ Request/response interceptors
- ✅ TypeScript support

## Service Modules

Each table has a corresponding service module with typed functions:

### Profile Service
```typescript
import * as profileService from './services/profileService';

const profile = await profileService.createProfile({
  id: uuid(),
  email: 'user@example.com',
  full_name: 'John Doe',
  employee_id: 'EMP001',
  is_admin: false
});
```

### Order Service
```typescript
import * as orderService from './services/orderService';

// Create order
const order = await orderService.createOrder({
  id: uuid(),
  user_id: userId,
  total_amount: 150.00,
  status: 'pending'
});

// Create order items
await orderService.createOrderItems([
  { id: uuid(), order_id: order.id, menu_item_id: '...', quantity: 2, price: 75 }
]);
```

### Menu Service
```typescript
import * as menuService from './services/menuService';

// List menu items
const items = await menuService.listMenuItems('lunch');

// Get daily menu
const dailyMenu = await menuService.getDailyMenu('2025-11-22', sessionId);
```

## Express Routes

Routes transform Oracle ORDS responses to match the frontend's expected format:

### POST /api/orders
Creates an order with items in a single request:
```json
{
  "user_id": "uuid",
  "total_amount": 150.00,
  "notes": "Extra spicy",
  "pickup_time": "2025-11-22T12:00:00Z",
  "items": [
    { "menu_item_id": "uuid", "quantity": 2, "price": 75.00 }
  ]
}
```

### GET /api/orders/user/:userId
Returns all orders for a user with items included.

### GET /api/menu/items?category=lunch
Returns filtered menu items.

## Data Mapping

Oracle ORDS endpoints expect JSON payloads matching the database schema:

| Table | ORDS Endpoint | Key Fields |
|-------|---------------|-----------|
| profiles | `/profiles/` | id, email, full_name, employee_id, is_admin |
| menu_items | `/menu_items/` | id, name, category, price, available |
| orders | `/orders/` | id, user_id, total_amount, status |
| order_items | `/order_items/` | id, order_id, menu_item_id, quantity, price |
| party_orders | `/party_orders/` | id, user_id, department, party_date, estimated_headcount |
| daily_menu | `/daily_menu/` | id, menu_date, session_id, menu_item_id |
| ingredients | `/ingredients/` | id, name, unit, cost_per_unit |
| stock_adjustments | `/stock_adjustments/` | id, ingredient_id, adjustment_type, quantity |
| consumption_logs | `/consumption_logs/` | id, ingredient_id, quantity_consumed, consumption_date |
| employee_deductions | `/employee_deductions/` | id, user_id, amount, deduction_date, deduction_month |

## Testing

### Test Oracle Connection

Create a simple test script:

```bash
node -e "
const axios = require('axios');
const auth = Buffer.from('xxindo:your_password').toString('base64');
axios.get('https://ge1b5fe67bdca57-indoramadbdev.adb.eu-amsterdam-1.oraclecloudapps.com/ords/xxindo/profiles/', {
  headers: { Authorization: \`Basic \${auth}\` }
}).then(r => console.log('✅ Connected:', r.data))
  .catch(e => console.error('❌ Error:', e.message));
"
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to install all dependencies.

### Oracle ORDS 401 Unauthorized
- Check `ORACLE_ORDS_USER` and `ORACLE_ORDS_PASSWORD` in `.env`
- Verify credentials with Oracle Cloud admin

### CORS errors
Ensure backend server is running and CORS is configured in `server/index.ts`.

### TypeScript errors
Run `npm run typecheck` to verify types.

## Migration Checklist

- [x] Remove Supabase dependencies
- [x] Create Oracle ORDS API client
- [x] Create service modules for all tables
- [x] Create Express routes
- [x] Update package.json
- [ ] Run `npm install`
- [x] Configure `.env` file (template created as `env.template`)
- [ ] Test backend server
- [ ] Verify frontend still works
- [ ] Deploy to production

## Next Steps

1. **Authentication**: Implement JWT token generation in `auth.ts`
2. **Password Hashing**: Add bcrypt for password security
3. **Middleware**: Add authentication middleware to protect routes
4. **Error Handling**: Enhance error responses
5. **Logging**: Add request/response logging
6. **Testing**: Add unit and integration tests
