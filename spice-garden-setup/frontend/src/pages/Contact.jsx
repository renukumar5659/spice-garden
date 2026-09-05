import { useState } from "react";
import { useToast } from "../context/ToastContext";

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
    <div className="container section-tight">
      <span className="eyebrow">Get in touch</span>
      <h1>Contact Us</h1>
      <div className="contact-layout">
        <div className="card contact-info">
          <h3>Restaurant Info</h3>
          <p>📍 14 Marigold Lane, Mahesana, Gujarat</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ hello@spicegarden.example</p>
          <p>🕒 11:00 AM – 11:00 PM, all week</p>
          <div className="map-embed">🗺️ Map placeholder — embed Google Maps here</div>
        </div>
        <form className="card contact-form" onSubmit={handleSubmit}>
          <h3>Send a Message</h3>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary btn-block">{sent ? "Sent ✓" : "Send Message"}</button>
        </form>
      </div>
    </div>
  );
}
