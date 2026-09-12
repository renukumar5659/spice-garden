import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import * as orderService from "../../services/orderService";

<style>{`
  /* SMALL + CLEAR ADMIN ORDERS UI */
  .admin-orders-modern {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 16px 28px;
  }

  .admin-orders-modern .orders-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    margin-bottom:12px;
  }

  .admin-orders-modern .orders-header h1 {
    margin:1px 0 3px;
    font-size:28px;
    line-height:1.15;
    letter-spacing:-.3px;
  }

  .admin-orders-modern .orders-header p {
    margin:0;
    color:#777;
    font-size:14px;
  }

  .admin-orders-modern .eyebrow {
    color:#9b4d18 !important;
    font-weight:800;
    font-size:11px !important;
    letter-spacing:1.2px;
  }

  .admin-orders-modern .orders-count {
    min-width:88px;
    padding:8px 12px;
    border:1px solid #ded8d2;
    border-radius:9px;
    background:#fff;
    text-align:center;
    box-shadow:0 1px 5px rgba(0,0,0,.035);
  }

  .admin-orders-modern .orders-count strong {
    display:block;
    font-size:23px;
    line-height:1;
  }

  .admin-orders-modern .orders-count span {
    display:block;
    margin-top:3px;
    color:#777;
    font-size:11px;
  }

  .admin-orders-modern .orders-toolbar {
    display:grid;
    grid-template-columns:minmax(250px,1fr) 155px 155px auto;
    gap:8px;
    align-items:end;
    padding:10px;
    border:1px solid #ded8d2;
    border-radius:10px;
    background:#fff;
    box-shadow:0 1px 6px rgba(0,0,0,.03);
  }

  .admin-orders-modern .orders-toolbar label,
  .admin-orders-modern .order-status-control label {
    display:block;
    margin-bottom:4px;
    font-size:11px;
    font-weight:800;
    color:#666;
  }

  .admin-orders-modern input,
  .admin-orders-modern select {
    width:100%;
    min-height:34px;
    box-sizing:border-box;
    border:1px solid #d8d1ca;
    border-radius:7px;
    background:#fff;
    padding:6px 9px;
    font-size:13px;
    outline:none;
  }

  .admin-orders-modern input:focus,
  .admin-orders-modern select:focus {
    border-color:#b86b35;
    box-shadow:0 0 0 2px rgba(184,107,53,.08);
  }

  .admin-orders-modern .reset-btn {
    min-height:34px;
    padding:6px 11px;
    border-radius:7px;
    font-size:13px;
    white-space:nowrap;
  }

  .admin-orders-modern .orders-result {
    padding:8px 1px 6px;
    color:#777;
    font-size:12px;
  }

  .admin-orders-modern .orders-list {
    display:grid;
    gap:8px;
  }

  .admin-orders-modern .order-card {
    overflow:hidden;
    border:1px solid #dcd6d0;
    border-radius:10px;
    background:#fff;
    box-shadow:0 1px 6px rgba(0,0,0,.03);
  }

  .admin-orders-modern .order-top {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    padding:9px 12px;
    border-bottom:1px solid #e9e4df;
  }

  .admin-orders-modern .order-heading {
    display:flex;
    align-items:baseline;
    flex-wrap:wrap;
    gap:6px;
    min-width:0;
  }

  .admin-orders-modern .order-heading small {
    color:#9b4d18;
    font-size:10px;
    font-weight:800;
    letter-spacing:.8px;
  }

  .admin-orders-modern .order-heading h3 {
    margin:0;
    font-size:16px;
  }

  .admin-orders-modern .order-date {
    color:#888;
    font-size:12px;
  }

  .admin-orders-modern .order-right {
    display:flex;
    align-items:center;
    gap:7px;
    flex-shrink:0;
  }

  .admin-orders-modern .order-total {
    font-size:18px;
    font-weight:800;
  }

  .admin-orders-modern .payment-badge {
    padding:3px 7px;
    border-radius:999px;
    background:#f1f1f1;
    color:#666;
    font-size:11px;
    font-weight:800;
  }

  .admin-orders-modern .payment-badge.paid {
    background:#e8f6ed;
    color:#287a4b;
  }

  .admin-orders-modern .payment-badge.failed {
    background:#fff0f0;
    color:#b13b3b;
  }

  .admin-orders-modern .payment-badge.pending {
    background:#fff5df;
    color:#9a6815;
  }

  .admin-orders-modern .order-main {
    display:grid;
    grid-template-columns:.9fr 1.35fr .9fr;
    gap:0;
  }

  .admin-orders-modern .order-section {
    min-width:0;
    padding:9px 12px;
    border-right:1px solid #e9e4df;
  }

  .admin-orders-modern .order-section:last-child {
    border-right:0;
  }

  .admin-orders-modern .order-section-title {
    display:flex;
    align-items:center;
    gap:5px;
    margin-bottom:5px;
    color:#777;
    font-size:11px;
    font-weight:800;
  }

  .admin-orders-modern .order-section-content {
    display:grid;
    gap:2px;
    font-size:12px;
  }

  .admin-orders-modern .order-section-content strong {
    font-size:13px;
  }

  .admin-orders-modern .order-section-content span {
    color:#777;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .admin-orders-modern .order-items {
    display:grid;
    gap:3px;
    max-height:48px;
    overflow:auto;
  }

  .admin-orders-modern .order-item {
    display:flex;
    justify-content:space-between;
    gap:6px;
    font-size:12px;
  }

  .admin-orders-modern .order-address {
    display:flex;
    gap:7px;
    padding:7px 12px;
    background:#faf9f8;
    border-top:1px solid #e9e4df;
  }

  .admin-orders-modern .order-address-icon {
    font-size:12px;
  }

  .admin-orders-modern .order-address p {
    margin:2px 0;
    color:#555;
    font-size:12px;
    line-height:1.4;
  }

  .admin-orders-modern .order-address small {
    color:#888;
    font-size:10px;
  }

  .admin-orders-modern .order-bottom {
    display:grid;
    grid-template-columns:155px 1fr auto;
    align-items:center;
    gap:9px;
    padding:8px 12px;
    border-top:1px solid #e9e4df;
  }

  .admin-orders-modern .order-current-status {
    display:grid;
    gap:2px;
  }

  .admin-orders-modern .order-current-status span {
    color:#888;
    font-size:10px;
  }

  .admin-orders-modern .order-current-status strong {
    font-size:12px;
  }

  .admin-orders-modern .order-details-btn {
    min-height:32px;
    padding:5px 9px;
    border-radius:7px;
    font-size:12px;
  }

  .admin-orders-modern .order-details {
    padding:9px 12px;
    border-top:1px solid #e9e4df;
    background:#fcfbfa;
  }

  .admin-orders-modern .order-details-grid {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:6px;
  }

  .admin-orders-modern .order-details-grid > div {
    padding:7px 8px;
    border:1px solid #e3ddd7;
    border-radius:7px;
    background:#fff;
  }

  .admin-orders-modern .order-details-grid span {
    display:block;
    margin-bottom:2px;
    color:#888;
    font-size:11px;
  }

  .admin-orders-modern .order-details-grid strong {
    display:block;
    font-size:11px;
    word-break:break-word;
  }

  .admin-orders-modern .order-instructions {
    margin-top:6px;
    padding:7px 8px;
    border:1px solid #e3ddd7;
    border-radius:7px;
    background:#fff;
  }

  .admin-orders-modern .order-instructions span {
    font-size:11px;
    font-weight:800;
    color:#888;
  }

  .admin-orders-modern .order-instructions p {
    margin:3px 0 0;
    font-size:10px;
  }

  .admin-orders-modern .empty-state {
    border:1px solid #dcd6d0;
    border-radius:10px;
    text-align:center;
    padding:25px 15px;
  }

  .admin-orders-modern .empty-icon {
    font-size:24px;
  }

  .admin-orders-modern .empty-state h2 {
    margin:6px 0 3px;
    font-size:16px;
  }

  .admin-orders-modern .empty-state p {
    margin:0;
    color:#888;
    font-size:12px;
  }

  .admin-orders-modern .order-actions {
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:7px;
  }

  .admin-orders-modern .order-print-btn {
    min-height:32px;
    padding:5px 9px;
    border-radius:7px;
    font-size:11px;
    white-space:nowrap;
  }

  /* absolutely no movement */
  .admin-orders-modern .order-card,
  .admin-orders-modern button,
  .admin-orders-modern .orders-count,
  .admin-orders-modern .orders-toolbar {
    transform:none !important;
    transition:none !important;
  }

  @media (max-width:850px) {
    .admin-orders-modern .orders-toolbar {
      grid-template-columns:1fr 1fr;
    }
    .admin-orders-modern .orders-search {
      grid-column:1 / -1;
    }
    .admin-orders-modern .order-main {
      grid-template-columns:1fr;
    }
    .admin-orders-modern .order-section {
      border-right:0;
      border-bottom:1px solid #e9e4df;
    }
    .admin-orders-modern .order-section:last-child {
      border-bottom:0;
    }
    .admin-orders-modern .order-bottom {
      grid-template-columns:1fr 1fr;
    }
    .admin-orders-modern .order-actions {
      grid-column:1 / -1;
      justify-content:flex-start;
    }
    .admin-orders-modern .order-details-grid {
      grid-template-columns:repeat(2,1fr);
    }
  }

  @media (max-width:560px) {
    .admin-orders-modern {
      padding:10px 8px 22px;
    }
    .admin-orders-modern .orders-header {
      align-items:flex-start;
    }
    .admin-orders-modern .orders-toolbar {
      grid-template-columns:1fr;
    }
    .admin-orders-modern .orders-search {
      grid-column:auto;
    }
    .admin-orders-modern .order-top {
      align-items:flex-start;
      flex-direction:column;
    }
    .admin-orders-modern .order-right {
      width:100%;
      justify-content:space-between;
    }
    .admin-orders-modern .order-bottom {
      grid-template-columns:1fr;
    }
    .admin-orders-modern .order-details-grid {
      grid-template-columns:1fr;
    }
  }
`}</style>


const STATUS_OPTIONS = [
  ["placed", "Order Placed"],
  ["confirmed", "Confirmed"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["out_for_delivery", "Out for Delivery"],
  ["delivered", "Delivered"],
];

const PAYMENT_OPTIONS = [
  ["all", "All Payments"],
  ["paid", "Paid"],
  ["pending", "Pending"],
  ["failed", "Failed"],
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentLabel(status) {
  const value = String(status || "").toLowerCase();

  if (value === "paid") return "Paid";
  if (value === "failed") return "Failed";
  if (value === "pending") return "Pending";

  return status || "Unknown";
}

function orderStatusLabel(status) {
  const found = STATUS_OPTIONS.find(([value]) => value === status);

  return found ? found[1] : status || "Unknown";
}


function printOrderSlip(order) {
  const customerName =
    order.customer_name || order.full_name || order.customer?.name || "Customer";

  const items = Array.isArray(order.items) ? order.items : [];
  const itemRows = items.map((item) => {
    const name = item.menu_item_detail?.name || item.menu_item_name || "Menu Item";
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    return `<tr><td>${name}</td><td class="qty">${qty}</td><td class="amount">₹${(price * qty).toFixed(0)}</td></tr>`;
  }).join("");

  const slip = `<!doctype html><html><head><meta charset="UTF-8">
  <title>Order Slip - ${order.order_id || ""}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;padding:15px;background:#fff;color:#222;font-family:Arial,sans-serif}
    .slip{width:80mm;max-width:100%;margin:auto;font-size:12px}
    .brand{text-align:center;border-bottom:1px dashed #777;padding-bottom:8px;margin-bottom:8px}
    .brand h1{margin:0;font-size:19px;letter-spacing:1px}.brand p{margin:3px 0 0;font-size:10px}
    .title{text-align:center;font-size:13px;font-weight:700;margin-bottom:8px}
    .meta{display:grid;gap:4px;border-bottom:1px dashed #777;padding-bottom:7px;margin-bottom:7px}
    .meta-row,.total-row{display:flex;justify-content:space-between;gap:8px}.label{color:#666}.value{text-align:right;font-weight:600}
    table{width:100%;border-collapse:collapse;margin:6px 0}th{text-align:left;border-bottom:1px solid #222;padding:4px 0;font-size:10px}
    td{padding:4px 0;border-bottom:1px dotted #ccc;vertical-align:top}th.qty,td.qty{width:28px;text-align:center}
    th.amount,td.amount{width:58px;text-align:right}.totals{border-top:1px dashed #777;padding-top:6px;display:grid;gap:4px}
    .grand{border-top:1px solid #222;margin-top:2px;padding-top:6px;font-size:15px;font-weight:800}
    .address{margin-top:8px;padding-top:7px;border-top:1px dashed #777}.address strong{display:block;margin-bottom:3px}
    .address p{margin:0;line-height:1.35}.footer{text-align:center;border-top:1px dashed #777;margin-top:9px;padding-top:8px;font-size:10px}
    @media print{@page{size:80mm auto;margin:5mm}body{padding:0}.slip{width:100%}}
  </style></head><body><main class="slip">
    <div class="brand"><h1>SPICE GARDEN</h1><p>Fresh • Tasty • Delivered</p></div>
    <div class="title">ORDER SLIP</div>
    <div class="meta">
      <div class="meta-row"><span class="label">Order ID</span><span class="value">${order.order_id || "—"}</span></div>
      <div class="meta-row"><span class="label">Date</span><span class="value">${formatDate(order.created_at)}</span></div>
      <div class="meta-row"><span class="label">Customer</span><span class="value">${customerName}</span></div>
      ${order.phone ? `<div class="meta-row"><span class="label">Phone</span><span class="value">${order.phone}</span></div>` : ""}
    </div>
    <table><thead><tr><th>Item</th><th class="qty">Qty</th><th class="amount">Amount</th></tr></thead>
    <tbody>${itemRows || '<tr><td colspan="3">No items</td></tr>'}</tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><strong>₹${Number(order.subtotal || 0).toFixed(0)}</strong></div>
      <div class="total-row"><span>Delivery</span><strong>₹${Number(order.delivery_charge || 0).toFixed(0)}</strong></div>
      <div class="total-row grand"><span>TOTAL</span><span>₹${Number(order.total_amount || 0).toFixed(0)}</span></div>
      <div class="total-row"><span>Payment</span><strong>${paymentLabel(order.payment_status)}</strong></div>
      <div class="total-row"><span>Status</span><strong>${orderStatusLabel(order.status)}</strong></div>
    </div>
    <div class="address"><strong>Delivery Address</strong><p>${order.delivery_address || "Address not available"}</p>
      ${order.pin_code ? `<p>PIN: ${order.pin_code}</p>` : ""}</div>
    <div class="footer">Thank you for ordering from Spice Garden!</div>
  </main></body></html>`;

  const printWindow = window.open("", "_blank", "width=420,height=700");
  if (!printWindow) { alert("Please allow pop-ups to print the order slip."); return; }
  printWindow.document.open();
  printWindow.document.write(slip);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [expandedOrders, setExpandedOrders] = useState({});

  const { showToast } = useToast();

  function loadOrders() {
    setLoading(true);

    orderService
      .fetchOrders()
      .then(setOrders)
      .catch(() => {
        showToast("Could not load orders", "error");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(order, status) {
    try {
      await orderService.updateOrderStatus(order.id, status);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status,
              }
            : o
        )
      );

      showToast(`Order ${order.order_id} updated`);
    } catch {
      showToast("Could not update order status", "error");
    }
  }

  function toggleDetails(orderId) {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.order_id || "")
          .toLowerCase()
          .includes(query) ||
        String(order.customer_name || "")
          .toLowerCase()
          .includes(query) ||
        String(order.full_name || "")
          .toLowerCase()
          .includes(query) ||
        String(order.phone || "")
          .toLowerCase()
          .includes(query) ||
        String(order.email || "")
          .toLowerCase()
          .includes(query);

      const matchesPayment =
        paymentFilter === "all" ||
        String(order.payment_status || "").toLowerCase() === paymentFilter;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, search, paymentFilter, statusFilter]);

  function resetFilters() {
    setSearch("");
    setPaymentFilter("all");
    setStatusFilter("all");
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container section-tight admin-orders-page admin-orders-modern">
      {/* PAGE HEADER */}
      <div className="orders-header">
        <div>
          <p className="eyebrow">SPICE GARDEN ADMIN</p>
          <h1>All Orders</h1>
          <p>Manage customer orders, payments and delivery status.</p>
        </div>

        <div className="orders-count">
          <strong>{orders.length}</strong>
          <span>Total Orders</span>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="card orders-toolbar">
        <div className="orders-search">
          <label htmlFor="order-search">Search Orders</label>

          <input
            id="order-search"
            type="text"
            placeholder="Search order ID, customer, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="orders-filter">
          <label htmlFor="payment-filter">Payment</label>

          <select
            id="payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            {PAYMENT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="orders-filter">
          <label htmlFor="status-filter">Order Status</label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>

            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-secondary reset-btn"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* RESULT COUNT */}
      <div className="orders-result">
        Showing <strong>{filteredOrders.length}</strong> of{" "}
        <strong>{orders.length}</strong> orders
      </div>

      {/* ORDERS */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="card empty-state orders-empty">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const expanded = Boolean(expandedOrders[order.id]);

            const customerName =
              order.customer_name ||
              order.full_name ||
              order.customer?.name ||
              "Customer";

            const paymentStatus = String(
              order.payment_status || "pending"
            ).toLowerCase();

            const statusClass = String(order.status || "placed").replace(
              /_/g,
              "-"
            );

            const paymentClass = paymentStatus.replace(/_/g, "-");

            return (
              <article className="card order-card" key={order.id}>
                {/* TOP */}
                <div className="order-top">
                  <div className="order-heading">
                    <small>ORDER</small>

                    <h3>{order.order_id}</h3>

                    <span className="order-date">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="order-right">
                    <div className="order-total">
                      ₹{Number(order.total_amount || 0).toFixed(0)}
                    </div>

                    <span className={`payment-badge ${paymentClass}`}>
                      {paymentLabel(order.payment_status)}
                    </span>
                  </div>
                </div>

                {/* MAIN INFORMATION */}
                <div className="order-main">
                  {/* CUSTOMER */}
                  <div className="order-section">
                    <div className="order-section-title">
                      <span>👤</span>
                      Customer
                    </div>

                    <div className="order-section-content">
                      <strong>{customerName}</strong>

                      {order.phone && (
                        <span>📞 {order.phone}</span>
                      )}

                      {order.email && (
                        <span>✉️ {order.email}</span>
                      )}
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="order-section order-items-section">
                    <div className="order-section-title">
                      <span>🍽️</span>
                      Items
                    </div>

                    <div className="order-items">
                      {Array.isArray(order.items) &&
                      order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div
                            className="order-item"
                            key={item.id || index}
                          >
                            <span>
                              {item.quantity}×{" "}
                              {item.menu_item_detail?.name ||
                                item.menu_item_name ||
                                "Menu Item"}
                            </span>

                            {item.price && (
                              <strong>
                                ₹
                                {(
                                  Number(item.price) *
                                  Number(item.quantity || 1)
                                ).toFixed(0)}
                              </strong>
                            )}
                          </div>
                        ))
                      ) : (
                        <span>No items</span>
                      )}
                    </div>
                  </div>

                  {/* PAYMENT */}
                  <div className="order-section">
                    <div className="order-section-title">
                      <span>💳</span>
                      Payment
                    </div>

                    <div className="order-section-content">
                      <strong className={`payment-text ${paymentClass}`}>
                        {paymentLabel(order.payment_status)}
                      </strong>

                      {order.razorpay_payment_id && (
                        <span className="payment-id">
                          Payment ID: {order.razorpay_payment_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="order-address">
                  <div className="order-address-icon">📍</div>

                  <div>
                    <span className="order-section-title">
                      Delivery Address
                    </span>

                    <p>
                      {order.delivery_address || "Address not available"}
                    </p>

                    {order.pin_code && (
                      <small>
                        PIN Code: {order.pin_code}
                      </small>
                    )}
                  </div>
                </div>

                {/* BOTTOM CONTROLS */}
                <div className="order-bottom">
                  <div className="order-status-control">
                    <label htmlFor={`status-${order.id}`}>
                      Order Status
                    </label>

                    <select
                      id={`status-${order.id}`}
                      value={order.status || "placed"}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value)
                      }
                      className={`status-select ${statusClass}`}
                    >
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="order-current-status">
                    <span>Current Status</span>
                    <strong>
                      {orderStatusLabel(order.status)}
                    </strong>
                  </div>

                  <div className="order-actions">
                    <button
                      type="button"
                      className="btn btn-secondary order-print-btn"
                      onClick={() => printOrderSlip(order)}
                    >
                      🖨️ Print Slip
                    </button>

                    <button
                    type="button"
                    className="btn btn-secondary order-details-btn"
                    onClick={() => toggleDetails(order.id)}
                  >
                    {expanded ? "Hide Details ↑" : "View Details ↓"}
                  </button>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {expanded && (
                  <div className="order-details">
                    <div className="order-details-grid">
                      <div>
                        <span>Order ID</span>
                        <strong>{order.order_id || "—"}</strong>
                      </div>

                      <div>
                        <span>Customer</span>
                        <strong>{customerName}</strong>
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>{order.email || "—"}</strong>
                      </div>

                      <div>
                        <span>Phone</span>
                        <strong>{order.phone || "—"}</strong>
                      </div>

                      <div>
                        <span>Subtotal</span>
                        <strong>
                          ₹
                          {Number(order.subtotal || 0).toFixed(0)}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery Charge</span>
                        <strong>
                          ₹
                          {Number(
                            order.delivery_charge || 0
                          ).toFixed(0)}
                        </strong>
                      </div>

                      <div>
                        <span>Total Amount</span>
                        <strong>
                          ₹
                          {Number(
                            order.total_amount || 0
                          ).toFixed(0)}
                        </strong>
                      </div>

                      <div>
                        <span>Payment Status</span>
                        <strong>
                          {paymentLabel(order.payment_status)}
                        </strong>
                      </div>

                      <div>
                        <span>Razorpay Order ID</span>
                        <strong>
                          {order.razorpay_order_id || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Razorpay Payment ID</span>
                        <strong>
                          {order.razorpay_payment_id || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Order Created</span>
                        <strong>
                          {formatDate(order.created_at)}
                        </strong>
                      </div>

                      <div>
                        <span>Last Updated</span>
                        <strong>
                          {formatDate(order.updated_at)}
                        </strong>
                      </div>
                    </div>

                    {order.special_instructions && (
                      <div className="order-instructions">
                        <span>Special Instructions</span>
                        <p>{order.special_instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}