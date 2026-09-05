import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import * as orderService from "../../services/orderService";

const STATUS_OPTIONS = [
  ["placed", "Order Placed"],
  ["confirmed", "Confirmed"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["out_for_delivery", "Out for Delivery"],
  ["delivered", "Delivered"],
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function loadOrders() {
    setLoading(true);
    orderService.fetchOrders().then(setOrders).finally(() => setLoading(false));
  }

  useEffect(loadOrders, []);

  async function handleStatusChange(order, status) {
    try {
      await orderService.updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      showToast(`Order ${order.order_id} updated`);
    } catch {
      showToast("Could not update order status", "error");
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <h1>All Orders</h1>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_id}</td>
                <td>{order.customer_name}</td>
                <td>{order.items.map((i) => `${i.quantity}× ${i.menu_item_detail?.name}`).join(", ")}</td>
                <td>₹{Number(order.total_amount).toFixed(0)}</td>
                <td>
                  <select value={order.status} onChange={(e) => handleStatusChange(order, e.target.value)}>
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
