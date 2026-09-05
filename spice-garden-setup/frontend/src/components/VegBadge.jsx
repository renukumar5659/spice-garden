export default function VegBadge({ isVeg }) {
  return (
    <span className={`badge ${isVeg ? "badge-veg" : "badge-nonveg"}`}>
      <span className={isVeg ? "veg-dot" : "nonveg-dot"} />
      {isVeg ? "Veg" : "Non-Veg"}
    </span>
  );
}
