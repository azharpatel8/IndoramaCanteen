import React, { useState, useEffect } from 'react';
import { feedbackService } from '../services/api';
import './Feedback.css';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    category: 'service',
    comment: '',
    order_id: '',
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackService.getAll();
      setFeedbacks(response.data);
    } catch (err) {
      setError('Failed to fetch feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        order_id: formData.order_id ? parseInt(formData.order_id) : null,
      };
      await feedbackService.submit(submitData);
      setFormData({
        rating: 5,
        category: 'service',
        comment: '',
        order_id: '',
      });
      setShowForm(false);
      fetchFeedback();
      alert('Thank you for your feedback!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2>Feedback & Reviews</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : 'Submit Feedback'}
        </button>
      </div>

      {showForm && (
        <div className="feedback-form-card">
          <h3>Share Your Feedback</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rating</label>
              <select name="rating" value={formData.rating} onChange={handleInputChange}>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="service">Service</option>
                <option value="food_quality">Food Quality</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="price">Price</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Order ID (Optional)</label>
              <input
                type="number"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                placeholder="Leave blank if feedback is not related to an order"
              />
            </div>

            <div className="form-group">
              <label>Comment</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Please share your feedback with us..."
                rows="4"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      <div className="feedbacks-list">
        <h3>Recent Feedback</h3>
        {loading && feedbacks.length === 0 && <div className="loading-spinner">Loading feedback...</div>}
        {error && feedbacks.length === 0 && <div className="alert alert-error">{error}</div>}
        {feedbacks.length === 0 && !loading ? (
          <div className="no-feedbacks">No feedback yet</div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.feedback_id} className="feedback-card">
              <div className="feedback-header-card">
                <div>
                  <h4>
                    <span className="stars">{renderStars(feedback.rating)}</span>
                  </h4>
                  <p className="feedback-category">{feedback.category}</p>
                </div>
                <p className="feedback-date">{new Date(feedback.created_at).toLocaleDateString()}</p>
              </div>
              {feedback.comment && <p className="feedback-comment">{feedback.comment}</p>}
              {feedback.order_id && <p className="feedback-order">Order #{feedback.order_id}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
