import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.95L22 10l-5.5 4.78L18.18 22 12 18.27 5.82 22l1.68-7.22L2 10l7.1-1.05L12 2z" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`dl-nav ${scrolled ? "is-scrolled" : ""}`} data-testid="site-nav">
      <Link to="/" className="dl-brand" data-testid="brand-link">
        <img src="/281229299.png" className="dl-brand-mark" alt="Logo" />
        <span className="dl-brand-text">
          <span className="dl-brand-title">Digital Liberia</span>
          <span className="dl-brand-sub">National Tech Initiative</span>
        </span>
      </Link>

      <nav className={`dl-nav-links ${open ? "is-open" : ""}`} aria-label="Primary">
        <NavLink to="/" end data-testid="nav-home">Home</NavLink>
        <NavLink to="/services" data-testid="nav-services">Services</NavLink>
        <a href="/#initiatives" data-testid="nav-initiatives">Initiatives</a>
        <a href="/#contact" data-testid="nav-contact-anchor">Contact</a>
        <button
          className="dl-theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          data-testid="theme-toggle"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <Link to="/services" className="dl-nav-cta" data-testid="nav-cta">
          Explore Pillars
        </Link>
      </nav>

      <div className="dl-nav-mobile-actions">
        <button
          className="dl-theme-toggle mobile"
          onClick={toggle}
          aria-label="Toggle theme"
          data-testid="theme-toggle-mobile"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          className={`dl-burger ${open ? "is-open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          data-testid="menu-toggle"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}