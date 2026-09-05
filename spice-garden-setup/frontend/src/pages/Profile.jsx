import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as authService from "../services/authService";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(form);
      await refreshProfile();
      showToast("Profile updated");
    } catch {
      showToast("Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container section-tight auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>My Profile</h1>
        <div className="field">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} />
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
      </form>
    </div>
  );
}
