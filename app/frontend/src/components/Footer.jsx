import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/api";

function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.95L22 10l-5.5 4.78L18.18 22 12 18.27 5.82 22l1.68-7.22L2 10l7.1-1.05L12 2z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await subscribeNewsletter({ email });
      toast.success("Subscribed — check your inbox for a welcome note.");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="dl-footer" data-testid="site-footer">
      <div className="dl-footer-grid">
        <div className="dl-footer-col brand">
          <div className="dl-footer-brand">
            <span className="dl-brand-mark small"><Star className="dl-brand-star" /></span>
            <div>
              <strong>Digital Liberia</strong>
              <span>Transforming the Republic, byte by byte.</span>
            </div>
          </div>
          <p className="dl-footer-blurb">
            A national programme building the digital backbone of a modern, inclusive Liberia.
          </p>
        </div>

        <div className="dl-footer-col">
          <h4>Pillars</h4>
          <ul>
            <li><Link to="/services/digital-economy">Digital Economy</Link></li>
            <li><Link to="/services/digital-markets">Digital Markets</Link></li>
            <li><Link to="/services/business-sme">Business & SME</Link></li>
            <li><Link to="/services/banking-fintech">Banking & FinTech</Link></li>
            <li><Link to="/services/national-digital-id">National Digital ID</Link></li>
            <li><Link to="/services/e-government">E-Government</Link></li>
          </ul>
        </div>

        <div className="dl-footer-col">
          <h4>Programme</h4>
          <ul>
            <li><Link to="/services">All Services</Link></li>
            <li><a href="/#initiatives">Initiatives</a></li>
            <li><a href="/#vision">Vision 2030</a></li>
            <li><a href="/#contact">Partner with us</a></li>
          </ul>
        </div>

        <div className="dl-footer-col newsletter">
          <h4>Stay informed</h4>
          <p>National updates on digital transformation, delivered occasionally.</p>
          <form onSubmit={handleSubscribe} className="dl-newsletter-form" data-testid="newsletter-form">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              data-testid="newsletter-email"
            />
            <button type="submit" disabled={loading} data-testid="newsletter-submit">
              {loading ? "…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="dl-footer-meta">
        <span>© {new Date().getFullYear()} Digital Liberia Initiative. All rights reserved.</span>
        <span className="dl-footer-flag" aria-hidden="true">
          <span className="fc red" />
          <span className="fc white" />
          <span className="fc blue" />
        </span>
      </div>
    </footer>
  );
}
