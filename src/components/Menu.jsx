import React, { useState, useEffect } from 'react';
import { menuService } from '../services/api';
import './Menu.css';

export default function Menu({ onAddToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState({});

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = selectedCategory
        ? await menuService.getByCategory(selectedCategory)
        : await menuService.getAll();
      setItems(response.data);
      const qtys = {};
      response.data.forEach((item) => {
        qtys[item.item_id] = 1;
      });
      setQuantity(qtys);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Main Course', 'Beverages', 'Desserts', 'Snacks'];

  const handleAddToCart = (item) => {
    const qty = quantity[item.item_id] || 1;
    onAddToCart({
      ...item,
      quantity: qty,
    });
    setQuantity((prev) => ({ ...prev, [item.item_id]: 1 }));
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantity((prev) => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(value, 10)),
    }));
  };

  if (loading) return <div className="loading-spinner">Loading menu...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="menu-container">
      <h2>Canteen Menu</h2>

      <div className="categories">
        <button
          className={`category-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {items.map((item) => (
          <div key={item.item_id} className="menu-card">
            {item.image_url && <img src={item.image_url} alt={item.name} className="item-image" />}
            <div className="item-content">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-footer">
                <span className="item-price">Rs. {item.price.toFixed(2)}</span>
                <div className="item-actions">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity[item.item_id] || 1}
                    onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value))}
                    className="qty-input"
                  />
                  <button
                    className="btn-add"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available}
                  >
                    Add
                  </button>
                </div>
              </div>
              {!item.is_available && <span className="badge-unavailable">Unavailable</span>}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <div className="no-items">No items found in this category</div>}
    </div>
  );
}
