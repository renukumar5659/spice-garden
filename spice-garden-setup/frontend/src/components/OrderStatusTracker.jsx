const STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const trackerStyles = `
  .status-tracker-modern {
    width: 100%;
    margin: 16px 0 4px;
    padding: 14px 12px;
    border: 1px solid #dedede;
    border-radius: 10px;
    box-sizing: border-box;
    overflow-x: auto;
  }

  .status-tracker-modern-inner {
    min-width: 620px;
    display: grid;
    grid-template-columns: repeat(6, minmax(90px, 1fr));
    gap: 4px;
  }

  .status-step-modern {
    position: relative;
    min-width: 0;
    text-align: center;
    padding: 0 4px;
  }

  .status-step-modern::before {
    content: "";
    position: absolute;
    top: 9px;
    left: calc(-50% + 9px);
    width: calc(100% - 18px);
    height: 1px;
    background: #d7d7d7;
    z-index: 0;
  }

  .status-step-modern:first-child::before {
    display: none;
  }

  .status-dot-modern {
    position: relative;
    z-index: 1;
    display: block;
    width: 18px;
    height: 18px;
    margin: 0 auto 8px;
    border: 2px solid #cfcfcf;
    border-radius: 50%;
    background: #fff;
    box-sizing: border-box;
  }

  .status-step-modern.done .status-dot-modern {
    background: #222;
    border-color: #222;
  }

  .status-step-modern.done::before {
    background: #222;
  }

  .status-label-modern {
    display: block;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
    color: #666;
  }

  .status-step-modern.done .status-label-modern {
    color: #222;
  }

  @media (max-width: 640px) {
    .status-tracker-modern {
      padding: 12px 8px;
    }

    .status-tracker-modern-inner {
      min-width: 570px;
    }

    .status-label-modern {
      font-size: 10px;
    }
  }
`;

export default function OrderStatusTracker({ status }) {
  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <>
      <style>{trackerStyles}</style>

      <div
        className="status-tracker-modern"
        aria-label={`Order status: ${status || "unknown"}`}
      >
        <div className="status-tracker-modern-inner">
          {STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`status-step-modern ${
                idx <= currentIndex ? "done" : ""
              }`}
            >
              <span className="status-dot-modern" aria-hidden="true" />
              <span className="status-label-modern">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
