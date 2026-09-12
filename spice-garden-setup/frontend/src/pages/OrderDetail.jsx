import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import OrderStatusTracker from "../components/OrderStatusTracker";
import * as orderService from "../services/orderService";

const orderDetailStyles = `
  .order-detail-page {
    max-width: 820px;
    margin: 0 auto;
    padding: 24px 16px 40px;
  }

  .order-detail-card {
    background: #fff;
    border: 1px solid #dedede;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.06);
  }

  .order-detail-kicker {
    margin: 0 0 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .order-detail-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  .order-detail-title-row h1 {
    margin: 0;
    font-size: 22px;
    line-height: 1.25;
  }

  .order-detail-date {
    margin: 0 0 18px;
    font-size: 13px;
    opacity: 0.72;
  }

  .order-detail-section {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid #e6e6e6;
  }

  .order-detail-section h3 {
    margin: 0 0 11px;
    font-size: 15px;
  }

  .order-detail-items {
    display: grid;
    gap: 7px;
  }

  .order-detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 11px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 13px;
  }

  .order-detail-item-name {
    min-width: 0;
    line-height: 1.4;
  }

  .order-detail-item-price {
    flex: 0 0 auto;
    font-weight: 700;
    white-space: nowrap;
  }

  .order-detail-summary {
    display: grid;
    gap: 8px;
  }

  .order-detail-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
  }

  .order-detail-summary-row.total {
    margin-top: 3px;
    padding-top: 11px;
    border-top: 1px solid #ddd;
    font-size: 16px;
    font-weight: 700;
  }

  .order-detail-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .order-detail-info-box {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 11px;
    font-size: 13px;
    line-height: 1.5;
  }

  .order-detail-info-label {
    display: block;
    margin-bottom: 3px;
    font-size: 11px;
    font-weight: 700;
    opacity: 0.68;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .order-detail-note {
    margin: 9px 0 0;
    padding: 10px 11px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .order-detail-page {
      padding: 18px 12px 30px;
    }

    .order-detail-card {
      padding: 16px;
      border-radius: 11px;
    }

    .order-detail-title-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .order-detail-title-row h1 {
      font-size: 20px;
    }

    .order-detail-info {
      grid-template-columns: 1fr;
    }
  }
`;

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.fetchOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!order) return <div className="container section-tight">Order not found.</div>;

  return (
    <>
      <style>{orderDetailStyles}</style>

      <div className="order-detail-page">
        <div className="order-detail-card">
          <p className="order-detail-kicker">SPICE GARDEN · ORDER DETAILS</p>

          <div className="order-detail-title-row">
            <h1>Order {order.order_id}</h1>
            <span className={`status-pill status-${order.status}`}>
              {String(order.status || "").replace(/_/g, " ")}
            </span>
          </div>

          <p className="order-detail-date">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>

          <OrderStatusTracker status={order.status} />

          <section className="order-detail-section">
            <h3>Order Items</h3>

            <div className="order-detail-items">
              {order.items.map((it) => (
                <div key={it.id} className="order-detail-item">
                  <span className="order-detail-item-name">
                    {it.menu_item_detail?.name || "Menu item"} × {it.quantity}
                  </span>
                  <span className="order-detail-item-price">
                    ₹{Number(it.line_total).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="order-detail-section">
            <h3>Bill Summary</h3>

            <div className="order-detail-summary">
              <div className="order-detail-summary-row">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toFixed(0)}</span>
              </div>

              <div className="order-detail-summary-row">
                <span>Delivery</span>
                <span>₹{Number(order.delivery_charge).toFixed(0)}</span>
              </div>

              <div className="order-detail-summary-row total">
                <span>Total</span>
                <span>₹{Number(order.total_amount).toFixed(0)}</span>
              </div>
            </div>
          </section>

          <section className="order-detail-section">
            <h3>Delivery Details</h3>

            <div className="order-detail-info">
              <div className="order-detail-info-box">
                <span className="order-detail-info-label">Customer</span>
                {order.full_name || "—"}
              </div>

              <div className="order-detail-info-box">
                <span className="order-detail-info-label">Phone</span>
                {order.phone || "—"}
              </div>

              <div className="order-detail-info-box">
                <span className="order-detail-info-label">Address</span>
                {order.delivery_address || "—"}
              </div>

              <div className="order-detail-info-box">
                <span className="order-detail-info-label">PIN Code</span>
                {order.pin_code || "—"}
              </div>
            </div>

            {order.special_instructions && (
              <p className="order-detail-note">
                <strong>Note:</strong> {order.special_instructions}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
