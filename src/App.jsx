import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Feedback from './components/Feedback';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCartItems([]);
    setActiveTab('menu');
  };

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((x) => x.item_id === item.item_id);
      if (existing) {
        return prev.map((x) =>
          x.item_id === item.item_id ? { ...x, quantity: x.quantity + item.quantity } : x
        );
      }
      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderPlaced = () => {
    setCartItems([]);
    setActiveTab('orders');
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout onLogout={handleLogout} user={user}>
      <div className="app-container">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback
          </button>
        </div>

        <div className="content-area">
          <div className="main-content">
            {activeTab === 'menu' && <Menu onAddToCart={handleAddToCart} />}
            {activeTab === 'orders' && <Orders />}
            {activeTab === 'feedback' && <Feedback />}
          </div>

          {activeTab === 'menu' && (
            <aside className="sidebar">
              <Cart
                items={cartItems}
                onOrderPlaced={handleOrderPlaced}
                onClear={handleRemoveFromCart}
              />
            </aside>
          )}
        </div>
      </div>
    </Layout>
  );
}
