import { CONFIG, QuickAction } from "../config";
import { SocialIcon } from "./Icons";

export function Home({ onAction, onSearch, onAsk }: {
  onAction: (a: QuickAction) => void;
  onSearch: () => void;
  onAsk: () => void;
}) {
  return (
    <div className="lw-home">
      <div className="lw-home-hero">
        <div className="lw-home-logo">{CONFIG.brand.assistant[0]}</div>
        <h2 className="lw-home-hi">Hola 👋</h2>
        <h1 className="lw-home-title">¿Cómo podemos ayudarte?</h1>
      </div>

      <button className="lw-ask-card" onClick={onAsk}>
        <div>
          <strong>Hacer una pregunta</strong>
          <span>{CONFIG.brand.assistant} y el equipo te responden</span>
        </div>
        <span className="lw-ask-arrow">›</span>
      </button>

      <div className="lw-qa-grid">
        {CONFIG.quickActions.map(a => (
          <button key={a.id} className="lw-qa" onClick={() => onAction(a)}>
            <span className="lw-qa-emoji">{a.emoji}</span>
            <span className="lw-qa-txt">
              <strong>{a.label}</strong>
              {a.sub && <small>{a.sub}</small>}
            </span>
            <span className="lw-qa-arrow">›</span>
          </button>
        ))}
      </div>

      <button className="lw-search-bar" onClick={onSearch}>
        <span>Buscar ayuda</span>
        <span className="lw-search-ico">🔍</span>
      </button>

      <div className="lw-social">
        {CONFIG.social.map(s => (
          <a key={s.id} className={`lw-social-btn lw-soc-${s.id}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
            <SocialIcon id={s.id} className="lw-social-svg" />
          </a>
        ))}
      </div>
    </div>
  );
}
