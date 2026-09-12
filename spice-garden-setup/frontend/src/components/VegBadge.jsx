const vegBadgeStyles = `
  .veg-badge-modern {
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
    font-weight: 600;
    white-space: nowrap;
  }

  .veg-badge-modern-dot {
    width: 7px;
    height: 7px;
    border: 1px solid currentColor;
    border-radius: 2px;
    box-sizing: border-box;
  }

  .veg-badge-modern-veg {
    color: #237a3b;
  }

  .veg-badge-modern-nonveg {
    color: #a33a32;
  }
`;

export default function VegBadge({ isVeg }) {
  const vegetarian = Boolean(isVeg);

  return (
    <>
      <style>{vegBadgeStyles}</style>

      <span
        className={`veg-badge-modern ${
          vegetarian
            ? "veg-badge-modern-veg"
            : "veg-badge-modern-nonveg"
        }`}
        aria-label={vegetarian ? "Vegetarian" : "Non-vegetarian"}
      >
        <span className="veg-badge-modern-dot" aria-hidden="true" />
        {vegetarian ? "Veg" : "Non-Veg"}
      </span>
    </>
  );
}
