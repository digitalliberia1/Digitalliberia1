import { useEffect, useState } from "react";
import "@/App.css";

const PILLARS = [
  {
    id: 1,
    title: "Digital Economy",
    desc: "Catalyzing growth through digital trade, e-commerce frameworks and data-driven public investment.",
    icon: "M3 17l6-6 4 4 8-8",
  },
  {
    id: 2,
    title: "Digital Markets",
    desc: "Modernizing local marketplaces with mobile payments, traceable supply chains and farmer-to-buyer platforms.",
    icon: "M3 3h18v4H3zM5 7v14h14V7M9 11h6",
  },
  {
    id: 3,
    title: "Business & SME Tech",
    desc: "Empowering Liberian entrepreneurs with cloud tools, registration portals and digital tax services.",
    icon: "M9 21V9h6v12M3 21V11l9-7 9 7v10",
  },
  {
    id: 4,
    title: "Banking & FinTech",
    desc: "Inclusive financial systems, interoperable mobile money and secure cross-border transactions for every citizen.",
    icon: "M3 10h18M5 10V7l7-4 7 4v3M5 10v8h14v-8M9 14h6",
  },
  {
    id: 5,
    title: "National Digital ID",
    desc: "A trusted, citizen-first identity system enabling secure access to services, voting and public benefits.",
    icon: "M4 6h16v12H4zM8 10a2 2 0 104 0 2 2 0 00-4 0zM6 16c.667-2 2.667-3 4-3s3.333 1 4 3M14 11h4M14 14h3",
  },
  {
    id: 6,
    title: "E-Government Services",
    desc: "Bringing ministries online — permits, healthcare, education and licensing accessible from anywhere.",
    icon: "M4 21V9l8-6 8 6v12M9 21v-7h6v7M11 11h2",
  },
];

const STATS = [
  { value: "15", label: "Counties Connected" },
  { value: "6", label: "Strategic Pillars" },
  { value: "5M+", label: "Citizens Empowered" },
  { value: "2030", label: "National Vision" },
];

function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.95L22 10l-5.5 4.78L18.18 22 12 18.27 5.82 22l1.68-7.22L2 10l7.1-1.05L12 2z" />
    </svg>
  );
}

function PillarIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Nav({ open, setOpen }) {
  return (
    <header className="dl-nav" data-testid="site-nav">
      <a href="#top" className="dl-brand" data-testid="brand-link">
        <span className="dl-brand-mark" aria-hidden="true">
          <Star className="dl-brand-star" />
        </span>
        <span className="dl-brand-text">
          <span className="dl-brand-title">Digital Liberia</span>
          <span className="dl-brand-sub">National Tech Initiative</span>
        </span>
      </a>

      <nav className={`dl-nav-links ${open ? "is-open" : ""}`} aria-label="Primary">
        <a href="#services" onClick={() => setOpen(false)} data-testid="nav-services">Services</a>
        <a href="#vision" onClick={() => setOpen(false)} data-testid="nav-vision">Vision</a>
        <a href="#impact" onClick={() => setOpen(false)} data-testid="nav-impact">Impact</a>
        <a href="#contact" onClick={() => setOpen(false)} className="dl-nav-cta" data-testid="nav-contact">
          Get in touch
        </a>
      </nav>

      <button
        className={`dl-burger ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        data-testid="menu-toggle"
      >
        <span></span><span></span><span></span>
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="dl-hero" data-testid="hero-section">
      <div className="dl-hero-stripes" aria-hidden="true">
        {Array.from({ length: 11 }).map((_, i) => (
          <span key={i} className={`dl-stripe ${i % 2 === 0 ? "red" : "white"}`} />
        ))}
      </div>

      <div className="dl-hero-inner">
        <span className="dl-eyebrow" data-testid="hero-eyebrow">
          <span className="dl-eyebrow-dot" /> A National Digital Transformation Programme
        </span>

        <h1 className="dl-h1" data-testid="hero-title">
          Transforming Liberia&rsquo;s
          <span className="dl-h1-accent"> technological infrastructure</span>
          <br />for every citizen.
        </h1>

        <p className="dl-lede" data-testid="hero-lede">
          From the markets of Monrovia to the banks of the Cavalla — Digital Liberia is rebuilding the
          systems that power the economy, business, public services and national identity.
        </p>

        <div className="dl-hero-cta">
          <a href="#services" className="dl-btn dl-btn-primary" data-testid="hero-cta-primary">
            Explore Services
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#contact" className="dl-btn dl-btn-ghost" data-testid="hero-cta-secondary">
            Partner with us
          </a>
        </div>

        <div className="dl-hero-meta">
          <div>
            <strong>Pillars</strong>
            <span>Six national priorities</span>
          </div>
          <div>
            <strong>Reach</strong>
            <span>All 15 counties</span>
          </div>
          <div>
            <strong>Horizon</strong>
            <span>Vision 2030</span>
          </div>
        </div>
      </div>

      <div className="dl-hero-emblem" aria-hidden="true">
        <div className="dl-emblem-square">
          <Star className="dl-emblem-star" />
        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="dl-mission reveal" data-testid="mission-section">
      <div className="dl-mission-grid">
        <div className="dl-mission-label">
          <span className="dl-rule" />
          Our Mission
        </div>
        <p className="dl-mission-text">
          To architect and deliver the digital backbone of a modern Liberia &mdash; one where technology
          accelerates inclusive economic growth, modernizes commerce, strengthens financial trust, and
          gives every citizen a verified, dignified place in the nation&rsquo;s digital future.
        </p>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="dl-services" data-testid="services-section">
      <div className="dl-section-head reveal">
        <div className="dl-section-eyebrow">
          <span className="dl-rule" /> Services
        </div>
        <h2 className="dl-h2">Six pillars of national digital transformation.</h2>
        <p className="dl-section-sub">
          Each pillar is a coordinated programme &mdash; combining policy, infrastructure and
          partnerships &mdash; designed to lift a critical sector of the Liberian economy.
        </p>
      </div>

      <div className="dl-pillar-grid">
        {PILLARS.map((p, idx) => (
          <article
            key={p.id}
            className="dl-pillar reveal"
            style={{ transitionDelay: `${idx * 60}ms` }}
            data-testid={`pillar-card-${p.id}`}
          >
            <div className="dl-pillar-num">{String(p.id).padStart(2, "0")}</div>
            <div className="dl-pillar-icon"><PillarIcon d={p.icon} /></div>
            <h3 className="dl-pillar-title">{p.title}</h3>
            <p className="dl-pillar-desc">{p.desc}</p>
            <span className="dl-pillar-arrow" aria-hidden="true">→</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Vision() {
  return (
    <section id="vision" className="dl-vision" data-testid="vision-section">
      <div className="dl-vision-inner">
        <div className="dl-vision-copy reveal">
          <div className="dl-section-eyebrow light">
            <span className="dl-rule light" /> Vision 2030
          </div>
          <h2 className="dl-h2 light">A connected republic, built on trust and code.</h2>
          <p className="dl-vision-text">
            By 2030, every Liberian will hold a secure digital identity, every market will trade on
            transparent rails, every business will run on modern tools, and every public service will
            be a tap away. Digital Liberia is not a project &mdash; it is the next chapter of the republic.
          </p>
          <ul className="dl-vision-list">
            <li><Star className="dl-li-star" /> Universal digital ID coverage</li>
            <li><Star className="dl-li-star" /> Cashless-first marketplaces</li>
            <li><Star className="dl-li-star" /> 100% online ministry services</li>
            <li><Star className="dl-li-star" /> Sovereign data infrastructure</li>
          </ul>
        </div>
        <div className="dl-vision-card reveal">
          <div className="dl-vision-card-top">
            <span>Programme Charter</span>
            <Star className="dl-vision-card-star" />
          </div>
          <blockquote className="dl-quote">
            &ldquo;A nation that builds its digital foundation today, builds prosperity for generations.&rdquo;
          </blockquote>
          <div className="dl-vision-card-foot">
            <span className="dl-author">Digital Liberia Initiative</span>
            <span className="dl-author-sub">Office of National Transformation</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Impact() {
  return (
    <section id="impact" className="dl-impact" data-testid="impact-section">
      <div className="dl-section-head reveal">
        <div className="dl-section-eyebrow">
          <span className="dl-rule" /> Impact
        </div>
        <h2 className="dl-h2">Measured by the lives we modernize.</h2>
      </div>
      <div className="dl-stats">
        {STATS.map((s, i) => (
          <div key={i} className="dl-stat reveal" style={{ transitionDelay: `${i * 80}ms` }} data-testid={`stat-${i}`}>
            <div className="dl-stat-value">{s.value}</div>
            <div className="dl-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const email = "doeblah004@gmail.com";
  return (
    <section id="contact" className="dl-contact" data-testid="contact-section">
      <div className="dl-contact-inner reveal">
        <div className="dl-contact-eyebrow">
          <span className="dl-rule light" /> Get involved
        </div>
        <h2 className="dl-h2 light">
          Build the future of Liberia <span className="dl-h2-accent">with us.</span>
        </h2>
        <p className="dl-contact-sub">
          Government partners, technologists, investors and citizens &mdash; we want to hear from you.
        </p>

        <a href={`mailto:${email}?subject=Partnership%20with%20Digital%20Liberia`} className="dl-email-card" data-testid="email-card">
          <div className="dl-email-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18v12H3z" />
              <path d="M3 6l9 7 9-7" />
            </svg>
          </div>
          <div className="dl-email-body">
            <span className="dl-email-label">Write to the initiative</span>
            <span className="dl-email-addr">{email}</span>
          </div>
          <span className="dl-email-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="dl-footer" data-testid="site-footer">
      <div className="dl-footer-inner">
        <div className="dl-footer-brand">
          <span className="dl-brand-mark small"><Star className="dl-brand-star" /></span>
          <div>
            <strong>Digital Liberia</strong>
            <span>Transforming the Republic, byte by byte.</span>
          </div>
        </div>
        <div className="dl-footer-links">
          <a href="#services">Services</a>
          <a href="#vision">Vision</a>
          <a href="#impact">Impact</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="dl-footer-meta">
          © {new Date().getFullYear()} Digital Liberia Initiative. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Smooth-scroll + scroll reveal
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    const handler = (e) => {
      const id = e.currentTarget.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    links.forEach((l) => l.addEventListener("click", handler));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => {
      links.forEach((l) => l.removeEventListener("click", handler));
      io.disconnect();
    };
  }, []);

  return (
    <div className="dl-root" data-testid="app-root">
      <Nav open={menuOpen} setOpen={setMenuOpen} />
      <main>
        <Hero />
        <Mission />
        <Services />
        <Vision />
        <Impact />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
