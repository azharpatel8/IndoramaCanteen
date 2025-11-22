# Database Seeding Guide

## Overview

The `seed.ts` script populates your Oracle database with dummy data for testing and development.

## What Gets Created

### 👤 **3 User Profiles**
- **Admin User** (admin@indorama.com) - Employee ID: EMP001
- **John Doe** (john.doe@indorama.com) - Employee ID: EMP002  
- **Jane Smith** (jane.smith@indorama.com) - Employee ID: EMP003

### ⏰ **3 Meal Sessions**
- **Breakfast** (7:00 AM - 10:00 AM)
- **Lunch** (12:00 PM - 2:00 PM)
- **Dinner** (6:00 PM - 8:00 PM)

### 🥬 **4 Ingredients**
- Rice (100 kg in stock)
- Chicken (50 kg in stock)
- Tomato (30 kg in stock)
- Onion (25 kg in stock)

### 🍽️ **6 Menu Items**

**Breakfast:**
- Continental Breakfast - $5.50
- Pancakes - $6.00

**Lunch:**
- Grilled Chicken Rice - $12.00 (includes chicken + rice ingredients)
- Vegetable Curry - $10.00 (includes tomato + onion + rice ingredients)

**Dinner:**
- Beef Steak - $18.00
- Fish and Chips - $14.00

### 📅 **Daily Menu** (for today)
- All 6 menu items are available for their respective sessions

### 📦 **2 Sample Orders**
- John's lunch order: 1x Grilled Chicken Rice ($12.00) - Status: Pending
- Jane's dinner order: 1x Beef Steak + 1x Fish and Chips ($32.00) - Status: Completed

### 🎉 **1 Party Order**
- Engineering department celebration
- 25 people estimated
- 1 week from now
- Items: 15x Grilled Chicken Rice + 10x Vegetable Curry

### 💰 **2 Employee Deductions**
- Deductions for John and Jane's orders

## How to Run

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Configure `.env` file with Oracle ORDS credentials:
```env
ORACLE_ORDS_BASE_URL=https://ge1b5fe67bdca57-indoramadbdev.adb.eu-amsterdam-1.oraclecloudapps.com/ords/xxindo
ORACLE_ORDS_USER=xxindo
ORACLE_ORDS_PASSWORD=your_password
```

### Run the Seed Script

```bash
npm run seed
```

### Expected Output

```
🌱 Starting database seeding...

👤 Creating profiles...
✅ Created 3 profiles

⏰ Creating meal sessions...
✅ Created 3 meal sessions

🥬 Creating ingredients...
✅ Created 4 ingredients

🍽️ Creating menu items...
✅ Created 6 menu items

🔗 Linking ingredients to menu items...
✅ Created menu item ingredient links

📅 Creating daily menu...
✅ Created daily menu for today

📦 Creating sample orders...
✅ Created 2 sample orders

🎉 Creating party order...
✅ Created 1 party order

💰 Creating employee deductions...
✅ Created 2 employee deductions

🎉 Database seeding completed successfully!

Summary:
- 3 profiles (1 admin, 2 users)
- 3 meal sessions (breakfast, lunch, dinner)
- 4 ingredients
- 6 menu items (2 breakfast, 2 lunch, 2 dinner)
- 6 daily menu entries for today
- 2 regular orders
- 1 party order
- 2 employee deductions

✨ Seeding complete!
```

## Troubleshooting

### Error: "Cannot find module"
Run `npm install` to install all dependencies.

### Error: Oracle ORDS 401 Unauthorized
Check your `.env` file and verify:
- `ORACLE_ORDS_BASE_URL` is correct
- `ORACLE_ORDS_USER` is correct
- `ORACLE_ORDS_PASSWORD` is correct

### Error: Duplicate data
If you've already run the seed script, you may need to clear the database first, or the script may fail on duplicate UUIDs. You can modify the script to use different IDs or delete existing data first.

## Customization

You can modify `server/seed.ts` to:
- Add more users
- Create different menu items
- Add more ingredients
- Create additional orders
- Customize prices and quantities

## Reset Database

To reset the database, you'll need to:
1. Delete all data from Oracle tables (use Oracle SQL Developer or similar)
2. Re-run the seed script

## Verification

After seeding, you can verify the data by:

1. **Start the backend server:**
```bash
npm run server:dev
```

2. **Test the API endpoints:**
```bash
# Get all menu items
curl http://localhost:3001/api/menu/items

# Get all profiles
curl http://localhost:3001/api/auth/profile/:id

# Get daily menu for today
curl "http://localhost:3001/api/menu/daily?date=2025-11-22"
```

3. **Check the frontend:**
- Start the frontend: `npm run dev`
- Browse to http://localhost:5173
- Login with test user credentials
- View menu, orders, etc.
