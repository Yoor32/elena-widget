import { CONFIG } from "../config";

export function NewsPanel() {
  return (
    <div className="lw-news">
      <div className="lw-news-head">
        <strong>Novedades</strong>
        <span>De {CONFIG.brand.name}</span>
      </div>
      {CONFIG.news.map((n, i) => (
        <a className="lw-news-card" key={i} href={n.url} target="_blank" rel="noopener noreferrer">
          <span className="lw-news-tag">{n.tag}</span>
          <strong className="lw-news-title">{n.title}</strong>
          <span className="lw-news-body">{n.body}</span>
          <span className="lw-news-link">Ver más ›</span>
        </a>
      ))}
    </div>
  );
}
