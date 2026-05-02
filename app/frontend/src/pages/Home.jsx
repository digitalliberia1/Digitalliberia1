import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Globe2, Zap } from "lucide-react";
import { fetchServices, fetchInitiatives } from "@/lib/api";
import { ServiceIcon } from "@/lib/icons";
import Counter from "@/components/Counter";
import ContactForm from "@/components/ContactForm";

function Star({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.95L22 10l-5.5 4.78L18.18 22 12 18.27 5.82 22l1.68-7.22L2 10l7.1-1.05L12 2z" />
    </svg>
  );
}

const STATS = [
  { value: "15", label: "Counties Connected" },
  { value: "6", label: "Strategic Pillars" },
  { value: "2.1M", label: "Citizens Enrolled" },
  { value: "47", label: "Services Online" },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "Privacy-by-design", desc: "Citizen consent and data minimization at the core of every system." },
  { icon: Globe2, title: "Sovereign infrastructure", desc: "National data hosted in-country with regional redundancy." },
  { icon: Zap, title: "Mobile-first delivery", desc: "Every service designed to work on a basic smartphone, online or offline." },
  { icon: Sparkles, title: "Open & interoperable", desc: "Open standards so banks, ministries and SMEs can plug in." },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [initiatives, setInitiatives] = useState([]);

  useEffect(() => {
    fetchServices().then(setServices).catch(() => {});
    fetchInitiatives().then((data) => setInitiatives(data.slice(0, 6))).catch(() => {});
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible") && io.unobserve(e.target)),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [services, initiatives]);

  // Smooth scroll for in-page anchors
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest('a[href^="/#"], a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href").split("#")[1];
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${hash}`);
      }
    };
    document.addEventListener("click", handler);
    // If page lands with hash, scroll to it
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200);
    }
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="dl-page">
      {/* HERO */}
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
            <Link to="/services" className="dl-btn dl-btn-primary" data-testid="hero-cta-primary">
              Explore Services <ArrowRight size={16} />
            </Link>
            <a href="#contact" className="dl-btn dl-btn-ghost" data-testid="hero-cta-secondary">
              Partner with us
            </a>
          </div>

          <div className="dl-hero-meta">
            <div><strong>Pillars</strong><span>Six national priorities</span></div>
            <div><strong>Reach</strong><span>All 15 counties</span></div>
            <div><strong>Horizon</strong><span>Vision 2030</span></div>
          </div>
        </div>

        <div className="dl-hero-emblem" aria-hidden="true">
          <div className="dl-emblem-square"><Star className="dl-emblem-star" /></div>
        </div>
      </section>

      {/* MISSION */}
      <section className="dl-mission reveal" data-testid="mission-section">
        <div className="dl-mission-grid">
          <div className="dl-mission-label"><span className="dl-rule" /> Our Mission</div>
          <p className="dl-mission-text">
            To architect and deliver the digital backbone of a modern Liberia &mdash; one where technology
            accelerates inclusive economic growth, modernizes commerce, strengthens financial trust, and
            gives every citizen a verified, dignified place in the nation&rsquo;s digital future.
          </p>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="dl-principles" data-testid="principles-section">
        <div className="dl-section-head reveal">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Operating Principles</div>
          <h2 className="dl-h2">Built on trust, designed for everyone.</h2>
        </div>
        <div className="dl-principle-grid">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="dl-principle reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="dl-principle-icon"><p.icon size={22} strokeWidth={1.6} /></div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section id="services" className="dl-services" data-testid="services-section">
        <div className="dl-section-head reveal">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Services</div>
          <h2 className="dl-h2">Six pillars of national digital transformation.</h2>
          <p className="dl-section-sub">
            Each pillar is a coordinated programme &mdash; combining policy, infrastructure and
            partnerships &mdash; designed to lift a critical sector of the Liberian economy.
          </p>
        </div>

        <div className="dl-pillar-grid">
          {(services.length ? services : []).map((p, idx) => (
            <Link
              key={p.slug}
              to={`/services/${p.slug}`}
              className="dl-pillar reveal"
              style={{ transitionDelay: `${idx * 60}ms` }}
              data-testid={`pillar-card-${p.slug}`}
            >
              <div className="dl-pillar-num">{String(idx + 1).padStart(2, "0")}</div>
              <div className="dl-pillar-icon"><ServiceIcon name={p.icon} size={26} /></div>
              <h3 className="dl-pillar-title">{p.title}</h3>
              <p className="dl-pillar-desc">{p.tagline}</p>
              <span className="dl-pillar-arrow" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>

        <div className="dl-services-cta reveal">
          <Link to="/services" className="dl-btn dl-btn-primary" data-testid="all-services-cta">
            See all services <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* INITIATIVES */}
      <section id="initiatives" className="dl-initiatives" data-testid="initiatives-section">
        <div className="dl-section-head reveal">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Live Initiatives</div>
          <h2 className="dl-h2">What we&rsquo;re building right now.</h2>
        </div>
        <div className="dl-initiative-grid">
          {initiatives.map((it, i) => (
            <article key={it.id} className="dl-initiative reveal" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="dl-init-top">
                <span className={`dl-status dl-status-${it.status}`}>{it.status}</span>
                <span className="dl-init-sector">{it.sector}</span>
              </div>
              <h3>{it.title}</h3>
              <p>{it.summary}</p>
              <div className="dl-init-foot">
                <span>📍 {it.region}</span>
                <Link to={`/services/${it.pillar_slug}`} className="dl-init-link">
                  View pillar <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="dl-vision" data-testid="vision-section">
        <div className="dl-vision-inner">
          <div className="dl-vision-copy reveal">
            <div className="dl-section-eyebrow light"><span className="dl-rule light" /> Vision 2030</div>
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

      {/* IMPACT / STATS */}
      <section id="impact" className="dl-impact" data-testid="impact-section">
        <div className="dl-section-head reveal">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Impact</div>
          <h2 className="dl-h2">Measured by the lives we modernize.</h2>
        </div>
        <div className="dl-stats">
          {STATS.map((s, i) => (
            <div key={i} className="dl-stat reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="dl-stat-value">
                <Counter value={s.value} testId={`stat-value-${i}`} />
              </div>
              <div className="dl-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="dl-contact" data-testid="contact-section">
        <div className="dl-contact-grid">
          <div className="dl-contact-copy reveal">
            <div className="dl-contact-eyebrow"><span className="dl-rule light" /> Get involved</div>
            <h2 className="dl-h2 light">
              Build the future of Liberia <span className="dl-h2-accent">with us.</span>
            </h2>
            <p className="dl-contact-sub">
              Government partners, technologists, investors and citizens &mdash; we want to hear from you.
            </p>
            <div className="dl-contact-direct">
              <span className="dl-contact-direct-label">Direct line</span>
              <a href="mailto:doeblah004@gmail.com">doeblah004@gmail.com</a>
            </div>
          </div>
          <div className="dl-contact-form-wrap reveal">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
