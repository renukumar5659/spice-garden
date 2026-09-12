import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import * as orderService from "../services/orderService";

const STATUS_LABELS = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .fetchOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <div className="container section-tight">
        <EmptyState
          icon="📦"
          title="No orders yet"
          message="Once you place an order, it'll show up here."
          action={
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container section-tight">
      <div className="orders-page">
        <div className="orders-header">
          <div>
            <div className="orders-eyebrow">SPICE GARDEN</div>
            <h1>My Orders</h1>
            <p>View your recent orders and track their status.</p>
          </div>

          <div className="orders-count">
            <strong>{orders.length}</strong>
            <span>Total Orders</span>
          </div>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const statusLabel =
              STATUS_LABELS[order.status] || order.status || "Processing";

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="order-card"
              >
                <div className="order-main">
                  <div className="order-icon">📦</div>

                  <div className="order-info">
                    <h3>{order.order_id}</h3>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="order-status">
                  <span
                    className={`status-pill status-${order.status}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="order-amount">
                  <span>Total</span>
                  <strong>
                    ₹{Number(order.total_amount).toFixed(0)}
                  </strong>
                </div>

                <div className="order-arrow">›</div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .orders-page {
          max-width: 980px;
          margin: 0 auto;
        }

        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .orders-eyebrow {
          margin-bottom: 3px;
          color: #9b4d18;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .orders-header h1 {
          margin: 0;
          color: #352118;
          font-size: 28px;
          line-height: 1.2;
        }

        .orders-header p {
          margin: 5px 0 0;
          color: #777;
          font-size: 13px;
        }

        .orders-count {
          min-width: 90px;
          padding: 9px 12px;
          border: 1px solid #ddd5ce;
          border-radius: 9px;
          background: #fff;
          text-align: center;
        }

        .orders-count strong {
          display: block;
          color: #3b2419;
          font-size: 21px;
          line-height: 1;
        }

        .orders-count span {
          display: block;
          margin-top: 4px;
          color: #777;
          font-size: 10px;
        }

        .orders-list {
          display: grid;
          gap: 9px;
        }

        .order-card {
          display: grid;
          grid-template-columns: minmax(250px, 1fr) auto auto 20px;
          align-items: center;
          gap: 16px;
          min-height: 68px;
          padding: 10px 13px;
          border: 1px solid #ddd6cf;
          border-radius: 10px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 1px 6px rgba(50, 30, 20, 0.035);
        }

        .order-card:hover {
          border-color: #cdbeb2;
          background: #fffdfa;
        }

        .order-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .order-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border: 1px solid #e5dcd5;
          border-radius: 8px;
          background: #faf6f2;
          font-size: 16px;
        }

        .order-info {
          min-width: 0;
        }

        .order-info h3 {
          margin: 0;
          color: #352118;
          font-size: 14px;
          font-weight: 800;
        }

        .order-date {
          display: block;
          margin-top: 3px;
          color: #888;
          font-size: 11px;
        }

        .order-status {
          white-space: nowrap;
        }

        .status-pill {
          display: inline-block;
          padding: 5px 8px;
          border: 1px solid #ded8d2;
          border-radius: 6px;
          background: #faf9f8;
          color: #5d514a;
          font-size: 10px;
          font-weight: 700;
        }

        .status-placed {
          background: #fff8e8;
          border-color: #ead9aa;
          color: #87651d;
        }

        .status-confirmed,
        .status-ready {
          background: #eef8ee;
          border-color: #cce2cd;
          color: #2f6d33;
        }

        .status-preparing {
          background: #fff4e9;
          border-color: #ead1b9;
          color: #94551e;
        }

        .status-out_for_delivery {
          background: #eef5ff;
          border-color: #cedcf0;
          color: #38628e;
        }

        .status-delivered {
          background: #edf8f0;
          border-color: #c8dfcd;
          color: #28703a;
        }

        .order-amount {
          min-width: 75px;
          text-align: right;
        }

        .order-amount span {
          display: block;
          margin-bottom: 2px;
          color: #888;
          font-size: 10px;
        }

        .order-amount strong {
          color: #8b4513;
          font-size: 15px;
        }

        .order-arrow {
          color: #8b4513;
          font-size: 24px;
          line-height: 1;
          text-align: center;
        }

        @media (max-width: 720px) {
          .orders-header {
            align-items: flex-start;
          }

          .order-card {
            grid-template-columns: 1fr auto;
            gap: 9px 12px;
          }

          .order-main {
            grid-column: 1;
          }

          .order-status {
            grid-column: 2;
            grid-row: 1;
          }

          .order-amount {
            grid-column: 1;
            text-align: left;
          }

          .order-arrow {
            grid-column: 2;
            grid-row: 2;
          }
        }

        @media (max-width: 480px) {
          .orders-header h1 {
            font-size: 24px;
          }

          .orders-header p {
            font-size: 12px;
          }

          .orders-count {
            min-width: 72px;
            padding: 8px 9px;
          }

          .orders-count strong {
            font-size: 18px;
          }

          .order-card {
            padding: 10px;
          }

          .order-icon {
            width: 30px;
            height: 30px;
            flex-basis: 30px;
            font-size: 14px;
          }

          .order-info h3 {
            font-size: 13px;
          }

          .order-date {
            font-size: 10px;
          }
        }

        .orders-page *,
        .orders-page *::before,
        .orders-page *::after {
          transition: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
}
