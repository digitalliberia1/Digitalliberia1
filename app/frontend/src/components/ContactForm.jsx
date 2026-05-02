import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { submitContact } from "@/lib/api";

const SECTORS = [
  "Government",
  "Banking & Finance",
  "Telecom & ISP",
  "Education",
  "Health",
  "NGO / Multilateral",
  "Investor",
  "Citizen",
  "Other",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    sector: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2) return "Please enter your name";
    if (!form.email.includes("@")) return "Please enter a valid email";
    if (form.message.trim().length < 10)
      return "Message must be at least 10 characters";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      await submitContact(form);
      toast.success("Message sent — we'll be in touch soon.");
      setDone(true);
      setForm({ name: "", email: "", organization: "", sector: "", message: "" });
    } catch (e2) {
      toast.error(e2?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="dl-form-success" data-testid="contact-success">
        <div className="dl-form-success-icon"><Send size={28} /></div>
        <h3>Thank you.</h3>
        <p>Your message has been received. The Digital Liberia team will review and respond within 3 business days.</p>
        <button className="dl-btn dl-btn-ghost" onClick={() => setDone(false)} data-testid="send-another">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="dl-contact-form" onSubmit={onSubmit} data-testid="contact-form" noValidate>
      <div className="dl-form-row two">
        <label className="dl-field">
          <span>Full name</span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            autoComplete="name"
            data-testid="contact-name"
          />
        </label>
        <label className="dl-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
            data-testid="contact-email"
          />
        </label>
      </div>

      <div className="dl-form-row two">
        <label className="dl-field">
          <span>Organization</span>
          <input
            name="organization"
            value={form.organization}
            onChange={onChange}
            autoComplete="organization"
            data-testid="contact-org"
          />
        </label>
        <label className="dl-field">
          <span>Sector</span>
          <select
            name="sector"
            value={form.sector}
            onChange={onChange}
            data-testid="contact-sector"
          >
            <option value="">Select a sector</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="dl-field">
        <span>How can we collaborate?</span>
        <textarea
          name="message"
          rows={5}
          value={form.message}
          onChange={onChange}
          required
          minLength={10}
          data-testid="contact-message"
        />
      </label>

      <button type="submit" className="dl-btn dl-btn-primary" disabled={loading} data-testid="contact-submit">
        {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
