import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, quizTitle, quizId, username, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    
    // For demo purposes - just simulate success
    setTimeout(() => {
      if (onRatingSubmitted) {
        onRatingSubmitted({ rating, review });
      }
      resetForm();
      onClose();
      setSubmitting(false);
    }, 500);
  };

  const resetForm = () => {
    setRating(0);
    setReview('');
    setHoveredRating(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content rating-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate Quiz</h3>
          <button onClick={handleClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="quiz-title-display">
            <h4>"{quizTitle}"</h4>
            <p>How would you rate this quiz? Your feedback helps other learners!</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Your Rating *</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${
                      star <= (hoveredRating || rating) ? 'filled' : ''
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star size={28} />
                  </button>
                ))}
              </div>
              <div className="rating-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="review-section">
              <label>Your Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this quiz..."
                rows={4}
                maxLength={500}
              />
              <div className="character-count">
                {review.length}/500 characters
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={handleClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={rating === 0 || submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
