import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Users } from "lucide-react";
import { fetchService, fetchServices, fetchInitiatives } from "@/lib/api";
import { ServiceIcon } from "@/lib/icons";
import Counter from "@/components/Counter";

const STATUS_LABEL = {
  active: "Active",
  piloting: "Piloting",
  planning: "Planning",
  completed: "Completed",
};

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setService(null);
    Promise.all([
      fetchService(slug),
      fetchServices(),
      fetchInitiatives({ pillar: slug }),
    ])
      .then(([detail, all, inits]) => {
        if (!mounted) return;
        setService(detail);
        setAllServices(all);
        setInitiatives(inits);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.status === 404 ? "Service not found" : "Failed to load");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <div className="dl-page">
        <div className="dl-loading" data-testid="service-loading">Loading…</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="dl-page">
        <section className="dl-page-header">
          <div className="dl-page-header-inner">
            <h1 className="dl-h1 small">Service not found</h1>
            <p className="dl-lede">The pillar you&rsquo;re looking for doesn&rsquo;t exist.</p>
            <Link to="/services" className="dl-btn dl-btn-primary"><ArrowLeft size={16} /> Back to all services</Link>
          </div>
        </section>
      </div>
    );
  }

  const others = allServices.filter((s) => s.slug !== slug).slice(0, 3);
  const idx = allServices.findIndex((s) => s.slug === slug);
  const next = idx >= 0 ? allServices[(idx + 1) % allServices.length] : null;

  return (
    <div className="dl-page">
      {/* HERO */}
      <section className="dl-detail-hero" data-testid="service-detail-hero">
        <div className="dl-detail-hero-inner">
          <Link to="/services" className="dl-back-link" data-testid="back-to-services">
            <ArrowLeft size={14} /> All services
          </Link>

          <div className="dl-detail-hero-grid">
            <div>
              <span className="dl-eyebrow">
                <span className="dl-eyebrow-dot" /> {service.sector}
              </span>
              <h1 className="dl-h1 small" data-testid="service-title">{service.title}</h1>
              <p className="dl-lede" data-testid="service-tagline">{service.tagline}</p>
            </div>
            <div className="dl-detail-icon-block">
              <div className="dl-detail-icon"><ServiceIcon name={service.icon} size={56} /></div>
              <span>Pillar {String(idx + 1).padStart(2, "0")} of {allServices.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW + METRICS */}
      <section className="dl-detail-overview" data-testid="service-overview">
        <div className="dl-overview-grid">
          <div className="dl-overview-text">
            <div className="dl-section-eyebrow"><span className="dl-rule" /> Overview</div>
            <p>{service.overview}</p>
          </div>
          <div className="dl-overview-metrics">
            {service.metrics.map((m, i) => (
              <div key={i} className="dl-metric-card">
                <div className="dl-metric-value">
                  <Counter value={m.value} testId={`metric-${i}`} />
                </div>
                <div className="dl-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="dl-detail-objectives" data-testid="service-objectives">
        <div className="dl-section-head">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Objectives</div>
          <h2 className="dl-h2 small">What this pillar will deliver.</h2>
        </div>
        <ul className="dl-objective-list">
          {service.objectives.map((o, i) => (
            <li key={i} className="dl-objective">
              <span className="dl-obj-check"><Check size={16} /></span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* PROGRAMMES */}
      <section className="dl-detail-programmes" data-testid="service-programmes">
        <div className="dl-section-head">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Programmes</div>
          <h2 className="dl-h2 small">Active workstreams under this pillar.</h2>
        </div>
        <div className="dl-prog-grid">
          {service.programmes.map((p, i) => (
            <article key={i} className="dl-prog-card" data-testid={`programme-${i}`}>
              <span className={`dl-status dl-status-${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {/* INITIATIVES SPECIFIC TO THIS PILLAR */}
      {initiatives.length > 0 && (
        <section className="dl-detail-initiatives" data-testid="service-initiatives">
          <div className="dl-section-head">
            <div className="dl-section-eyebrow"><span className="dl-rule" /> On the ground</div>
            <h2 className="dl-h2 small">Live initiatives in {service.title}.</h2>
          </div>
          <div className="dl-initiative-grid">
            {initiatives.map((it) => (
              <article key={it.id} className="dl-initiative">
                <div className="dl-init-top">
                  <span className={`dl-status dl-status-${it.status}`}>{it.status}</span>
                  <span className="dl-init-sector">{it.sector}</span>
                </div>
                <h3>{it.title}</h3>
                <p>{it.summary}</p>
                <div className="dl-init-foot">
                  <span>📍 {it.region}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PARTNERS */}
      <section className="dl-detail-partners" data-testid="service-partners">
        <div className="dl-section-head">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Partners</div>
          <h2 className="dl-h2 small">Building this pillar with us.</h2>
        </div>
        <div className="dl-partner-row">
          {service.partners.map((p) => (
            <div key={p} className="dl-partner-chip">
              <Users size={14} /> {p}
            </div>
          ))}
        </div>
      </section>

      {/* OTHER PILLARS */}
      <section className="dl-detail-related" data-testid="service-related">
        <div className="dl-section-head">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Continue exploring</div>
          <h2 className="dl-h2 small">Other pillars of Digital Liberia.</h2>
        </div>
        <div className="dl-pillar-grid">
          {others.map((p, i) => (
            <Link
              key={p.slug}
              to={`/services/${p.slug}`}
              className="dl-pillar"
              data-testid={`related-pillar-${p.slug}`}
            >
              <div className="dl-pillar-num">{String(allServices.findIndex((x) => x.slug === p.slug) + 1).padStart(2, "0")}</div>
              <div className="dl-pillar-icon"><ServiceIcon name={p.icon} size={26} /></div>
              <h3 className="dl-pillar-title">{p.title}</h3>
              <p className="dl-pillar-desc">{p.tagline}</p>
              <div className="dl-pillar-foot">
                <span className="dl-pillar-tag">{p.sector}</span>
                <span className="dl-pillar-arrow"><ArrowRight size={18} /></span>
              </div>
            </Link>
          ))}
        </div>
        {next && (
          <div className="dl-next-pillar">
            <Link to={`/services/${next.slug}`} className="dl-btn dl-btn-primary">
              Next pillar: {next.title} <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
