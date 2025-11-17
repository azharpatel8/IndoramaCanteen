import React, { useState } from 'react';
import { orderService, billingService } from '../services/api';
import './Cart.css';

export default function Cart({ items, onOrderPlaced, onClear }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
        special_instructions: specialInstructions || null,
      };

      const orderResponse = await orderService.create(orderData);
      const orderId = orderResponse.data.order_id;

      const billingData = {
        order_id: orderId,
        payment_method: paymentMethod,
        transaction_id: `TXN-${Date.now()}`,
      };

      await billingService.create(billingData);

      onOrderPlaced();
      setSpecialInstructions('');
      setPaymentMethod('cash');
      alert(`Order placed successfully! Order ID: ${orderId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (itemId) => {
    onClear(itemId);
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h3>Order Summary</h3>
        <div className="empty-cart">Your cart is empty</div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="cart-container">
      <h3>Order Summary</h3>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-items">
        {items.map((item, index) => (
          <div key={index} className="cart-item">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">x {item.quantity}</span>
            </div>
            <div className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</div>
            <button className="btn-remove" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-form">
        <div className="form-group">
          <label>Special Instructions</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests or dietary preferences?"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="digital">Digital Wallet</option>
          </select>
        </div>
      </div>

      <div className="cart-total">
        <div className="total-row">
          <span>Total:</span>
          <span className="total-amount">Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
}
