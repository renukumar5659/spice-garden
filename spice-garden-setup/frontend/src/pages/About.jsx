const aboutStyles = `
  .about-page-modern {
    max-width: 1040px;
    margin: 0 auto;
    padding: 24px 16px 40px;
  }

  .about-heading {
    margin-bottom: 20px;
  }

  .about-heading .eyebrow {
    display: inline-block;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .about-heading h1 {
    margin: 0;
    font-size: 25px;
    line-height: 1.25;
  }

  .about-intro {
    max-width: 760px;
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.65;
  }

  .about-grid-modern {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .about-card-modern {
    background: #fff;
    border: 1px solid #dedede;
    border-radius: 11px;
    padding: 16px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  }

  .about-card-modern h3 {
    margin: 0 0 9px;
    font-size: 15px;
    line-height: 1.35;
  }

  .about-card-modern p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
  }

  @media (max-width: 760px) {
    .about-page-modern {
      padding: 18px 12px 30px;
    }

    .about-grid-modern {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .about-heading h1 {
      font-size: 21px;
    }

    .about-card-modern {
      padding: 14px;
    }
  }
`;

export default function About() {
  return (
    <>
      <style>{aboutStyles}</style>

      <div className="about-page-modern">
        <div className="about-heading">
          <span className="eyebrow">About us</span>
          <h1>Spice Garden Restaurant</h1>
        </div>

        <p className="about-intro">
          Spice Garden Restaurant is a family-friendly restaurant serving delicious Indian
          and Indo-Chinese cuisine using fresh ingredients and authentic spices.
        </p>

        <div className="about-grid-modern">
          <div className="about-card-modern">
            <h3>🌿 Fresh, always</h3>
            <p>
              We source vegetables and spices daily and grind our own masalas in-house.
            </p>
          </div>

          <div className="about-card-modern">
            <h3>👨‍👩‍👧‍👦 Family-run</h3>
            <p>
              Three generations of recipes, cooked the same way they always have been.
            </p>
          </div>

          <div className="about-card-modern">
            <h3>🔥 Cooked to order</h3>
            <p>
              Nothing is pre-made — every tikka, curry, and stir-fry starts when you order.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
