import { useState } from "react";
import { useToast } from "../context/ToastContext";

const contactStyles = `
  .contact-page {
    max-width: 1040px;
    margin: 0 auto;
    padding: 24px 16px 40px;
  }

  .contact-heading {
    margin-bottom: 18px;
  }

  .contact-heading .eyebrow {
    display: inline-block;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .contact-heading h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }

  .contact-layout {
    display: grid;
    grid-template-columns: 0.95fr 1.05fr;
    gap: 16px;
    align-items: start;
  }

  .contact-card {
    background: #fff;
    border: 1px solid #dedede;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .contact-card h3 {
    margin: 0 0 13px;
    font-size: 16px;
  }

  .contact-info-list {
    display: grid;
    gap: 9px;
  }

  .contact-info-item {
    padding: 9px 10px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.45;
  }

  .map-embed {
    margin-top: 13px;
    min-height: 105px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border: 1px dashed #cfcfcf;
    border-radius: 8px;
    text-align: center;
    font-size: 12px;
    line-height: 1.45;
  }

  .contact-form {
    display: grid;
    gap: 0;
  }

  .contact-form .field {
    margin-bottom: 12px;
  }

  .contact-form label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    font-weight: 600;
  }

  .contact-form input,
  .contact-form textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #d8d8d8;
    border-radius: 7px;
    padding: 9px 10px;
    font: inherit;
    font-size: 13px;
    line-height: 1.4;
    background: #fff;
  }

  .contact-form input {
    min-height: 39px;
  }

  .contact-form textarea {
    min-height: 100px;
    resize: vertical;
  }

  .contact-form input:focus,
  .contact-form textarea:focus {
    outline: none;
    border-color: #999;
  }

  .contact-submit {
    width: 100%;
    min-height: 40px;
    margin-top: 2px;
    font-size: 13px;
  }

  @media (max-width: 720px) {
    .contact-page {
      padding: 18px 12px 30px;
    }

    .contact-layout {
      grid-template-columns: 1fr;
    }

    .contact-card {
      padding: 16px;
      border-radius: 10px;
    }

    .contact-heading h1 {
      font-size: 21px;
    }
  }
`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    showToast("Message sent — we'll get back to you soon!");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <>
      <style>{contactStyles}</style>

      <div className="contact-page">
        <div className="contact-heading">
          <span className="eyebrow">Get in touch</span>
          <h1>Contact Us</h1>
        </div>

        <div className="contact-layout">
          <div className="contact-card">
            <h3>Restaurant Info</h3>

            <div className="contact-info-list">
              <div className="contact-info-item">
                📍 14 Marigold Lane, Mahesana, Gujarat
              </div>
              <div className="contact-info-item">
                📞 +91 98765 43210
              </div>
              <div className="contact-info-item">
                ✉️ hello@spicegarden.example
              </div>
              <div className="contact-info-item">
                🕒 11:00 AM – 11:00 PM, all week
              </div>
            </div>

            <div className="map-embed">
              🗺️ Map placeholder — embed Google Maps here
            </div>
          </div>

          <form className="contact-card contact-form" onSubmit={handleSubmit}>
            <h3>Send a Message</h3>

            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary contact-submit">
              {sent ? "Sent ✓" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
