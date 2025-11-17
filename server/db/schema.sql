-- Indorama Canteen Database Schema for Oracle
-- Run this script to create the required tables and sequences

-- Create Users Table
CREATE TABLE users (
  user_id NUMBER PRIMARY KEY,
  username VARCHAR2(100) UNIQUE NOT NULL,
  email VARCHAR2(100) UNIQUE NOT NULL,
  password_hash VARCHAR2(255) NOT NULL,
  full_name VARCHAR2(255) NOT NULL,
  role VARCHAR2(20) NOT NULL,
  department VARCHAR2(100),
  phone VARCHAR2(20),
  is_active NUMBER(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

-- Create Menu Items Table
CREATE TABLE menu_items (
  item_id NUMBER PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description VARCHAR2(500),
  category VARCHAR2(50) NOT NULL,
  price NUMBER(10,2) NOT NULL,
  available_quantity NUMBER(5),
  is_available NUMBER(1) DEFAULT 1,
  image_url VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE SEQUENCE menu_items_seq START WITH 1 INCREMENT BY 1;

-- Create Orders Table
CREATE TABLE orders (
  order_id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  order_date TIMESTAMP DEFAULT SYSTIMESTAMP,
  status VARCHAR2(50) NOT NULL,
  total_amount NUMBER(10,2),
  delivery_date TIMESTAMP,
  special_instructions VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE SEQUENCE orders_seq START WITH 1 INCREMENT BY 1;

-- Create Order Items Table
CREATE TABLE order_items (
  order_item_id NUMBER PRIMARY KEY,
  order_id NUMBER NOT NULL,
  item_id NUMBER NOT NULL,
  quantity NUMBER(5) NOT NULL,
  unit_price NUMBER(10,2) NOT NULL,
  subtotal NUMBER(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

CREATE SEQUENCE order_items_seq START WITH 1 INCREMENT BY 1;

-- Create Billing Table
CREATE TABLE billing (
  bill_id NUMBER PRIMARY KEY,
  order_id NUMBER NOT NULL,
  user_id NUMBER NOT NULL,
  amount NUMBER(10,2) NOT NULL,
  payment_method VARCHAR2(50) NOT NULL,
  payment_status VARCHAR2(50) NOT NULL,
  transaction_id VARCHAR2(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE SEQUENCE billing_seq START WITH 1 INCREMENT BY 1;

-- Create Feedback Table
CREATE TABLE feedback (
  feedback_id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  order_id NUMBER,
  rating NUMBER(1) NOT NULL,
  comment VARCHAR2(1000),
  category VARCHAR2(50) NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE SEQUENCE feedback_seq START WITH 1 INCREMENT BY 1;

-- Create Indexes for Performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_billing_order_id ON billing(order_id);
CREATE INDEX idx_billing_user_id ON billing(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Commit changes
COMMIT;
