import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Filter } from "lucide-react";
import { fetchServices, fetchInitiatives } from "@/lib/api";
import { ServiceIcon } from "@/lib/icons";

export default function ServicesHub() {
  const [services, setServices] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");

  useEffect(() => {
    fetchServices().then(setServices).catch(() => {});
    fetchInitiatives().then(setInitiatives).catch(() => {});
  }, []);

  const sectors = useMemo(() => {
    return ["All", ...Array.from(new Set(services.map((s) => s.sector)))];
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const matchesQ =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);
      const matchesSector = sector === "All" || s.sector === sector;
      return matchesQ && matchesSector;
    });
  }, [services, query, sector]);

  return (
    <div className="dl-page">
      {/* HEADER */}
      <section className="dl-page-header" data-testid="services-page-header">
        <div className="dl-page-header-inner">
          <span className="dl-eyebrow">
            <span className="dl-eyebrow-dot" /> Services
          </span>
          <h1 className="dl-h1 small">
            Six pillars. <span className="dl-h1-accent">One republic.</span>
          </h1>
          <p className="dl-lede">
            Explore each strategic pillar of the Digital Liberia programme — its mission,
            objectives, active programmes and partners.
          </p>

          <div className="dl-filter-bar" data-testid="services-filter">
            <label className="dl-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search pillars (e.g. banking, identity)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search services"
                data-testid="services-search"
              />
            </label>
            <div className="dl-chip-row" role="tablist" aria-label="Sector filter">
              <Filter size={14} className="dl-chip-icon" />
              {sectors.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`dl-chip ${sector === s ? "is-active" : ""}`}
                  onClick={() => setSector(s)}
                  data-testid={`sector-chip-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="dl-services" data-testid="services-grid">
        <div className="dl-pillar-grid">
          {filtered.length === 0 ? (
            <div className="dl-empty" data-testid="services-empty">
              No services match your filter. Try clearing the search.
            </div>
          ) : (
            filtered.map((p, idx) => (
              <Link
                key={p.slug}
                to={`/services/${p.slug}`}
                className="dl-pillar"
                data-testid={`pillar-card-${p.slug}`}
              >
                <div className="dl-pillar-num">{String(idx + 1).padStart(2, "0")}</div>
                <div className="dl-pillar-icon"><ServiceIcon name={p.icon} size={26} /></div>
                <h3 className="dl-pillar-title">{p.title}</h3>
                <p className="dl-pillar-desc">{p.tagline}</p>
                <div className="dl-pillar-foot">
                  <span className="dl-pillar-tag">{p.sector}</span>
                  <span className="dl-pillar-arrow"><ArrowRight size={18} /></span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* INITIATIVE TICKER */}
      <section className="dl-init-ticker" data-testid="init-ticker">
        <div className="dl-section-head">
          <div className="dl-section-eyebrow"><span className="dl-rule" /> Across the programme</div>
          <h2 className="dl-h2 small">{initiatives.length} live initiatives across {sectors.length - 1} sectors.</h2>
        </div>
        <div className="dl-ticker-grid">
          {initiatives.slice(0, 8).map((i) => (
            <Link key={i.id} to={`/services/${i.pillar_slug}`} className="dl-ticker-card">
              <span className={`dl-status dl-status-${i.status}`}>{i.status}</span>
              <strong>{i.title}</strong>
              <span className="dl-ticker-region">{i.region}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
