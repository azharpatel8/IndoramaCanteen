import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAll();
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancel(orderId);
        fetchOrders();
        alert('Order cancelled successfully');
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await orderService.getById(orderId);
      setSelectedOrder(response.data);
    } catch (err) {
      alert('Failed to fetch order details');
    }
  };

  if (loading) return <div className="loading-spinner">Loading orders...</div>;

  if (selectedOrder) {
    return (
      <div className="orders-container">
        <button className="btn-back" onClick={() => setSelectedOrder(null)}>
          Back to Orders
        </button>
        <div className="order-detail">
          <h3>Order #{selectedOrder.order_id}</h3>
          <div className="detail-row">
            <span className="label">Order Date:</span>
            <span>{new Date(selectedOrder.order_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className={`status status-${selectedOrder.status}`}>{selectedOrder.status}</span>
          </div>
          <div className="detail-row">
            <span className="label">Total Amount:</span>
            <span className="amount">Rs. {selectedOrder.total_amount?.toFixed(2)}</span>
          </div>
          {selectedOrder.special_instructions && (
            <div className="detail-row">
              <span className="label">Special Instructions:</span>
              <span>{selectedOrder.special_instructions}</span>
            </div>
          )}

          <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Items</h4>
          <div className="items-list">
            {selectedOrder.items?.map((item) => (
              <div key={item.order_item_id} className="list-item">
                <span>Item ID: {item.item_id} x {item.quantity}</span>
                <span>Rs. {item.subtotal?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <div>
                  <h4>Order #{order.order_id}</h4>
                  <p className="order-date">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <span className={`status status-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-body">
                <div className="order-info">
                  <span>Total: Rs. {order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="order-actions">
                  <button
                    className="btn-view"
                    onClick={() => handleViewDetails(order.order_id)}
                  >
                    View Details
                  </button>
                  {order.status === 'pending' && (
                    <button
                      className="btn-danger"
                      onClick={() => handleCancelOrder(order.order_id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
