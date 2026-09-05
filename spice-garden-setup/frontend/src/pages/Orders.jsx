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
    orderService.fetchOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <div className="container section-tight">
        <EmptyState
          icon="📦"
          title="No orders yet"
          message="Once you place an order, it'll show up here."
          action={<Link to="/menu" className="btn btn-primary">Browse Menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container section-tight">
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="order-row card">
            <div>
              <h4>{order.order_id}</h4>
              <span className="order-date">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
            <span className="order-total">₹{Number(order.total_amount).toFixed(0)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
