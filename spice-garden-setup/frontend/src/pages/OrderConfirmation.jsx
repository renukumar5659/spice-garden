import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import OrderStatusTracker from "../components/OrderStatusTracker";
import * as orderService from "../services/orderService";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .fetchOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="container section-tight">
        <div style={styles.notFound}>
          <h2 style={styles.notFoundTitle}>Order not found</h2>
          <p style={styles.notFoundText}>
            We could not find this order. Please check your My Orders page.
          </p>
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-tight">
      <div className="confirmation-page">
        <div className="confirmation-card card">
          <div className="confirmation-success">
            <div className="confirmation-check">✓</div>
            <div>
              <div className="confirmation-label">SPICE GARDEN</div>
              <h1>Order Confirmed!</h1>
              <p>Thank you — your order has been placed successfully.</p>
            </div>
          </div>

          <div className="order-id-chip">
            <span>Order ID</span>
            <strong>{order.order_id}</strong>
          </div>

          <div className="confirmation-section">
            <h3>Order Status</h3>
            <div className="status-box">
              <OrderStatusTracker status={order.status} />
            </div>
          </div>

          <div className="confirmation-section">
            <h3>Order Details</h3>

            <div className="receipt-items">
              {order.items.map((it) => (
                <div key={it.id} className="summary-line">
                  <span>
                    {it.menu_item_detail?.name || "Menu Item"} × {it.quantity}
                  </span>
                  <strong>₹{Number(it.line_total).toFixed(0)}</strong>
                </div>
              ))}
            </div>

            <div className="confirmation-divider" />

            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(0)}</span>
            </div>

            <div className="summary-line">
              <span>Delivery</span>
              <span>₹{Number(order.delivery_charge).toFixed(0)}</span>
            </div>

            <div className="summary-line total confirmation-total">
              <span>Total Paid</span>
              <strong>₹{Number(order.total_amount).toFixed(0)}</strong>
            </div>
          </div>

          <div className="payment-status">
            <span className="payment-dot">✓</span>
            <div>
              <strong>Payment Successful</strong>
              <small>Your payment has been received.</small>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/orders" className="btn btn-outline">
              View My Orders
            </Link>
            <Link to="/menu" className="btn btn-primary">
              Order More
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .confirmation-page {
          max-width: 760px;
          margin: 0 auto;
        }

        .confirmation-card {
          padding: 24px;
          border: 1px solid rgba(86, 55, 38, 0.16);
          border-radius: 14px;
          background: #fffaf3;
          box-shadow: 0 6px 18px rgba(57, 36, 24, 0.08);
        }

        .confirmation-success {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(86, 55, 38, 0.14);
        }

        .confirmation-check {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #2f7d32;
          color: #fff;
          font-size: 27px;
          font-weight: 800;
          line-height: 1;
        }

        .confirmation-label {
          margin-bottom: 3px;
          color: #9b251f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .confirmation-success h1 {
          margin: 0;
          color: #3a2117;
          font-size: 25px;
          line-height: 1.2;
        }

        .confirmation-success p {
          margin: 5px 0 0;
          color: #6f5a4b;
          font-size: 13px;
          line-height: 1.45;
        }

        .order-id-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 16px 0;
          padding: 10px 13px;
          border: 1px solid rgba(139, 69, 19, 0.2);
          border-radius: 9px;
          background: #fff;
          color: #5c4639;
          font-size: 12px;
        }

        .order-id-chip strong {
          color: #8b4513;
          font-size: 13px;
          letter-spacing: 0.2px;
        }

        .confirmation-section {
          margin-top: 16px;
          padding: 15px;
          border: 1px solid rgba(86, 55, 38, 0.13);
          border-radius: 10px;
          background: #fff;
        }

        .confirmation-section h3 {
          margin: 0 0 11px;
          color: #3a2117;
          font-size: 15px;
          line-height: 1.25;
        }

        .status-box {
          padding: 8px 5px 2px;
          border-radius: 7px;
          background: #fffaf5;
        }

        .receipt-items {
          display: grid;
          gap: 7px;
        }

        .summary-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 27px;
          color: #4f3b30;
          font-size: 13px;
        }

        .summary-line strong {
          color: #3a2117;
          font-weight: 700;
        }

        .confirmation-divider {
          height: 1px;
          margin: 9px 0;
          background: rgba(86, 55, 38, 0.13);
        }

        .confirmation-total {
          margin-top: 5px;
          padding-top: 9px;
          border-top: 1px solid rgba(86, 55, 38, 0.13);
          color: #3a2117;
          font-size: 14px;
          font-weight: 700;
        }

        .confirmation-total strong {
          color: #9b251f;
          font-size: 17px;
        }

        .payment-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          padding: 10px 12px;
          border: 1px solid rgba(47, 125, 50, 0.2);
          border-radius: 9px;
          background: rgba(47, 125, 50, 0.06);
        }

        .payment-dot {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #2f7d32;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .payment-status strong {
          display: block;
          color: #285f2a;
          font-size: 13px;
        }

        .payment-status small {
          display: block;
          margin-top: 2px;
          color: #5f675f;
          font-size: 11px;
        }

        .confirmation-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid rgba(86, 55, 38, 0.13);
        }

        .confirmation-actions .btn {
          min-height: 38px;
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .confirmation-page {
            width: 100%;
          }

          .confirmation-card {
            padding: 17px;
            border-radius: 11px;
          }

          .confirmation-success {
            align-items: flex-start;
            gap: 11px;
          }

          .confirmation-check {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
            font-size: 22px;
          }

          .confirmation-success h1 {
            font-size: 21px;
          }

          .confirmation-success p {
            font-size: 12px;
          }

          .order-id-chip {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }

          .confirmation-actions {
            flex-direction: column;
          }

          .confirmation-actions .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  notFound: {
    maxWidth: "600px",
    margin: "30px auto",
    padding: "24px",
    textAlign: "center",
    border: "1px solid rgba(86, 55, 38, 0.16)",
    borderRadius: "12px",
    background: "#fffaf3",
  },
  notFoundTitle: {
    margin: "0 0 7px",
    color: "#3a2117",
    fontSize: "20px",
  },
  notFoundText: {
    margin: "0 0 16px",
    color: "#6f5a4b",
    fontSize: "13px",
  },
};
