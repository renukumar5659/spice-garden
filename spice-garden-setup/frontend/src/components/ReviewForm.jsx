import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as reviewService from "../services/reviewService";

const reviewFormStyles = `
  .review-form-modern {
    width: 100%;
    max-width: 620px;
    padding: 18px;
    box-sizing: border-box;
    border: 1px solid #dedede;
    border-radius: 10px;
    background: #fff;
  }

  .review-form-modern h4 {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.4;
  }

  .review-form-modern-rating {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 12px;
  }

  .review-form-modern-star {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #d7d7d7;
    border-radius: 6px;
    background: #fff;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
  }

  .review-form-modern-star.star-filled {
    color: #222;
  }

  .review-form-modern-star.star-empty {
    color: #aaa;
  }

  .review-form-modern textarea {
    display: block;
    width: 100%;
    min-height: 82px;
    padding: 10px;
    margin: 0 0 11px;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid #d5d5d5;
    border-radius: 7px;
    background: #fff;
    font: inherit;
    font-size: 13px;
    line-height: 1.5;
    outline: none;
  }

  .review-form-modern textarea:focus,
  .review-form-modern-star:focus-visible {
    border-color: #222;
  }

  .review-form-modern-submit {
    min-height: 35px;
    padding: 7px 12px;
    font-size: 12px;
  }

  .review-login-prompt-modern {
    margin: 12px 0;
    padding: 12px;
    border: 1px solid #dedede;
    border-radius: 8px;
    background: #fafafa;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 520px) {
    .review-form-modern {
      padding: 14px;
    }

    .review-form-modern-star {
      width: 30px;
      height: 30px;
    }
  }
`;

export default function ReviewForm({ onSubmitted }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <style>{reviewFormStyles}</style>
        <p className="review-login-prompt-modern">
          Please log in to leave a review.
        </p>
      </>
    );
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
    <>
      <style>{reviewFormStyles}</style>

      <form className="review-form-modern" onSubmit={handleSubmit}>
        <h4>Leave a review</h4>

        <div className="review-form-modern-rating" aria-label="Choose a rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={`review-form-modern-star ${
                n <= rating ? "star-filled" : "star-empty"
              }`}
              onClick={() => setRating(n)}
              aria-label={`${n} star`}
              aria-pressed={n === rating}
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

        <button
          type="submit"
          className="btn btn-secondary review-form-modern-submit"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </>
  );
}
