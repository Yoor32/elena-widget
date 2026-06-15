import { useEffect, useRef, useState, lazy, Suspense, Component, type ReactNode } from "react";
import { CONFIG, QuickAction } from "./config";
import { Home } from "./components/Home";
import { ChatPanel } from "./components/ChatPanel";
import { HelpPanel } from "./components/HelpPanel";
import { NewsPanel } from "./components/NewsPanel";
import { SmartForm } from "./components/SmartForm";
import { IconHome, IconChat, IconHelp, IconNews } from "./components/Icons";
import type { PrecotTipo } from "./lib/precot";

type Tab = "home" | "messages" | "help" | "news";
const BUBBLE_KEY = "elena_bubble_shown";

// El módulo de voz (CallOverlay → @elevenlabs/react) se carga BAJO DEMANDA:
// no entra en el bundle inicial, solo cuando el usuario abre la llamada.
const importVoice = () => import("./components/CallOverlay").then(m => ({ default: m.CallOverlay }));

function VoiceLoading({ onClose }: { onClose: () => void }) {
  return (
    <div className="lw-call-overlay">
      <button className="lw-call-back" onClick={onClose} aria-label="Cerrar">✕</button>
      <div className="lw-spinner" />
      <p className="lw-call-status">Conectando…</p>
    </div>
  );
}

// Error boundary: si el chunk de voz no carga (red), muestra aviso suave + reintentar.
class VoiceBoundary extends Component<
  { onClose: () => void; onRetry: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div className="lw-call-overlay">
          <button className="lw-call-back" onClick={this.props.onClose} aria-label="Cerrar">✕</button>
          <p className="lw-call-status">No se pudo cargar la llamada. Revise su conexión.</p>
          <button className="lw-call-start" onClick={() => { this.setState({ failed: false }); this.props.onRetry(); }}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [calling, setCalling] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [preset, setPreset] = useState<string | null>(null);
  const [presetStepper, setPresetStepper] = useState<PrecotTipo | null>(null);
  const [bubble, setBubble] = useState(false);
  // Componente de voz lazy; se recrea para reintentar si falla la carga del chunk.
  const [Voice, setVoice] = useState(() => lazy(importVoice));
  const bubbleTimer = useRef<number | null>(null);

  // Burbuja proactiva del launcher: aparece tras ~4 s, 1 vez por sesión.
  useEffect(() => {
    if (open) return;
    if (sessionStorage.getItem(BUBBLE_KEY)) return;
    bubbleTimer.current = window.setTimeout(() => setBubble(true), 4000);
    return () => { if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current); };
  }, [open]);

  function dismissBubble() {
    setBubble(false);
    sessionStorage.setItem(BUBBLE_KEY, "1");
  }

  function openWidget(toTab: Tab = "home") {
    dismissBubble();
    setOpen(true);
    setTab(toTab);
  }

  function goChat(message?: string | null) {
    setPresetStepper(null);
    setPreset(message ?? null);
    setTab("messages");
  }

  function goPrecot(tipo: PrecotTipo) {
    setPreset(null);
    setPresetStepper(tipo);
    setTab("messages");
  }

  function handleAction(a: QuickAction) {
    if (a.kind === "link" && a.payload) window.open(a.payload, "_blank", "noopener");
    else if (a.kind === "form") setShowForm(true);
    else if (a.kind === "chat") goChat(a.payload);
    else if (a.kind === "call") setCalling(true);
    else if (a.kind === "tab" && a.payload) setTab(a.payload as Tab);
  }

  const navs: { id: Tab; label: string; Icon: typeof IconHome }[] = [
    { id: "home", label: "Inicio", Icon: IconHome },
    { id: "messages", label: "Mensajes", Icon: IconChat },
    { id: "help", label: "Ayuda", Icon: IconHelp },
    { id: "news", label: "Novedades", Icon: IconNews }
  ];

  return (
    <div className={`lw-root lw-side-${CONFIG.brand.side}`}>
      {open && (
        <div className="lw-panel">
          <header className="lw-header">
            <div className="lw-header-id">
              <div className="lw-avatar">{CONFIG.brand.assistant[0]}</div>
              <div>
                <strong>{CONFIG.brand.assistant}</strong>
                <span className="lw-sub">{CONFIG.brand.name}</span>
              </div>
            </div>
            <div className="lw-header-actions">
              <button className="lw-call-btn" title="Hablar con un asesor" onClick={() => setCalling(true)}>📞 Llamar</button>
              <button className="lw-icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            </div>
          </header>

          <div className="lw-body">
            {tab === "home" && <Home onAction={handleAction} onSearch={() => setTab("help")} onAsk={() => goChat()} />}
            {tab === "messages" && <ChatPanel initialMessage={preset} initialStepper={presetStepper} />}
            {tab === "help" && <HelpPanel onAsk={(q) => goChat(q)} />}
            {tab === "news" && <NewsPanel />}
          </div>

          <nav className="lw-nav">
            {navs.map(n => (
              <button
                key={n.id}
                className={tab === n.id ? "active" : ""}
                onClick={() => { setTab(n.id); if (n.id !== "messages") { setPreset(null); setPresetStepper(null); } }}
              >
                <n.Icon className="lw-nav-ico" />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {calling && (
            <VoiceBoundary onClose={() => setCalling(false)} onRetry={() => setVoice(() => lazy(importVoice))}>
              <Suspense fallback={<VoiceLoading onClose={() => setCalling(false)} />}>
                <Voice onClose={() => setCalling(false)} />
              </Suspense>
            </VoiceBoundary>
          )}
          {showForm && (
            <SmartForm
              onClose={() => setShowForm(false)}
              onGoChat={(msg) => { setShowForm(false); goChat(msg); }}
              onOpenPrecot={(tipo) => { setShowForm(false); goPrecot(tipo); }}
            />
          )}
        </div>
      )}

      {!open && (
        <div className="lw-launcher-wrap">
          {bubble && (
            <div className="lw-bubble">
              <button className="lw-bubble-x" onClick={dismissBubble} aria-label="Cerrar">✕</button>
              <button className="lw-bubble-body" onClick={() => openWidget("messages")}>
                {CONFIG.launcherGreeting}
              </button>
            </div>
          )}
          <button className={`lw-launcher ${bubble ? "pulse" : ""}`} onClick={() => openWidget("home")} aria-label="Abrir chat">
            <IconChat className="lw-launcher-ico" />
          </button>
        </div>
      )}
    </div>
  );
}
