export default function About() {
  return (
    <div className="container section-tight about-page">
      <span className="eyebrow">About us</span>
      <h1>Spice Garden Restaurant</h1>
      <p className="intro-text">
        Spice Garden Restaurant is a family-friendly restaurant serving delicious Indian
        and Indo-Chinese cuisine using fresh ingredients and authentic spices.
      </p>
      <div className="about-grid">
        <div className="card about-card">
          <h3>🌿 Fresh, always</h3>
          <p>We source vegetables and spices daily and grind our own masalas in-house.</p>
        </div>
        <div className="card about-card">
          <h3>👨‍👩‍👧‍👦 Family-run</h3>
          <p>Three generations of recipes, cooked the same way they always have been.</p>
        </div>
        <div className="card about-card">
          <h3>🔥 Cooked to order</h3>
          <p>Nothing is pre-made — every tikka, curry, and stir-fry starts when you order.</p>
        </div>
      </div>
    </div>
  );
}
