const SPICE_LEVELS = {
  mild: {
    label: "Mild",
    icon: "🌶️",
    count: 1,
  },
  medium: {
    label: "Medium",
    icon: "🌶️",
    count: 2,
  },
  hot: {
    label: "Hot",
    icon: "🌶️",
    count: 3,
  },
  cool: {
    label: "Cool",
    icon: "❄️",
    count: 0,
  },
  warm: {
    label: "Warm",
    icon: "🌶️",
    count: 1,
  },
};

const spiceStyles = `
  .spice-meter-modern {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 22px;
    padding: 3px 7px;
    box-sizing: border-box;
    border: 1px solid #d7d7d7;
    border-radius: 5px;
    background: #fff;
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
  }

  .spice-meter-modern-icons {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    letter-spacing: 0;
  }

  .spice-meter-modern-label {
    font-weight: 600;
  }

  .spice-meter-modern-empty {
    opacity: 0.55;
  }
`;

export default function SpiceMeter({ level }) {
  const normalizedLevel = String(level || "").toLowerCase();
  const spice = SPICE_LEVELS[normalizedLevel] || {
    label: level || "Not specified",
    icon: "",
    count: 0,
  };

  const iconCount = 3;

  return (
    <>
      <style>{spiceStyles}</style>

      <span
        className="spice-meter-modern"
        aria-label={`Spice level: ${spice.label}`}
      >
        <span className="spice-meter-modern-icons" aria-hidden="true">
          {Array.from({ length: iconCount }, (_, index) => (
            <span
              key={index}
              className={index < spice.count ? "" : "spice-meter-modern-empty"}
            >
              {spice.icon || "·"}
            </span>
          ))}
        </span>

        <span className="spice-meter-modern-label">
          {spice.label}
        </span>
      </span>
    </>
  );
}
