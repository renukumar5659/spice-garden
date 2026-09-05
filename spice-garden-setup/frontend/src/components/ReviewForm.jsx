import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as reviewService from "../services/reviewService";

export default function ReviewForm({ onSubmitted }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <p className="review-login-prompt">Please log in to leave a review.</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const review = await reviewService.submitReview({ rating, comment });
      setComment("");
      setRating(5);
      showToast("Thanks for your review!");
      onSubmitted?.(review);
    } catch {
      showToast("Could not submit your review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card review-form" onSubmit={handleSubmit}>
      <h4>Leave a review</h4>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={n <= rating ? "star-filled" : "star-empty"}
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Tell us about your experience…"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <button className="btn btn-secondary btn-sm" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
