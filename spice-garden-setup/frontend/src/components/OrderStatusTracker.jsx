const STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderStatusTracker({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="status-tracker">
      {STEPS.map((step, idx) => (
        <div key={step.key} className={`status-step ${idx <= currentIndex ? "done" : ""}`}>
          <span className="status-dot" />
          <span className="status-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
