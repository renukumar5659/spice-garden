const LEVELS = { mild: 1, medium: 2, hot: 3 };

export default function SpiceMeter({ level }) {
  const filled = LEVELS[level] || 1;
  return (
    <span className="spice-meter" title={`Spice level: ${level}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`dot ${n <= filled ? "filled" : ""}`} />
      ))}
    </span>
  );
}
