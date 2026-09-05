import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import OrderStatusTracker from "../components/OrderStatusTracker";
import * as orderService from "../services/orderService";

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
    <div className="container section-tight">
      <div className="card receipt">
        <h2>Order {order.order_id}</h2>
        <p className="order-date">{new Date(order.created_at).toLocaleString()}</p>
        <OrderStatusTracker status={order.status} />
        <div className="receipt-items">
          {order.items.map((it) => (
            <div key={it.id} className="summary-line">
              <span>{it.menu_item_detail?.name} × {it.quantity}</span>
              <span>₹{Number(it.line_total).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <hr />
        <div className="summary-line"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(0)}</span></div>
        <div className="summary-line"><span>Delivery</span><span>₹{Number(order.delivery_charge).toFixed(0)}</span></div>
        <div className="summary-line total"><span>Total</span><span>₹{Number(order.total_amount).toFixed(0)}</span></div>
        <h4>Delivery Details</h4>
        <p>{order.full_name} · {order.phone}</p>
        <p>{order.delivery_address} — {order.pin_code}</p>
        {order.special_instructions && <p><em>Note: {order.special_instructions}</em></p>}
      </div>
    </div>
  );
}
