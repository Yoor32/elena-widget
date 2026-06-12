import { useState } from "react";
import { CONFIG, QuickAction } from "./config";
import { Home } from "./components/Home";
import { ChatPanel } from "./components/ChatPanel";
import { HelpPanel } from "./components/HelpPanel";
import { NewsPanel } from "./components/NewsPanel";
import { CallOverlay } from "./components/CallOverlay";
import { SmartForm } from "./components/SmartForm";
import { IconHome, IconChat, IconHelp, IconNews } from "./components/Icons";

type Tab = "home" | "messages" | "help" | "news";
type FormAction = "cotizacion" | "rastrear" | "asesoria";

export function App() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [calling, setCalling] = useState(false);
  const [form, setForm] = useState<FormAction | null>(null);
  const [preset, setPreset] = useState<string | null>(null);

  function goChat(message?: string) {
    if (message) setPreset(message);
    setTab("messages");
  }

  function handleAction(a: QuickAction) {
    if (a.kind === "link" && a.payload) window.open(a.payload, "_blank", "noopener");
    else if (a.kind === "form" && a.payload) setForm(a.payload as FormAction);
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
            {tab === "messages" && <ChatPanel initialMessage={preset} onAction={handleAction} />}
            {tab === "help" && <HelpPanel onAsk={(q) => goChat(q)} />}
            {tab === "news" && <NewsPanel />}
          </div>

          <nav className="lw-nav">
            {navs.map(n => (
              <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => { setTab(n.id); if (n.id !== "messages") setPreset(null); }}>
                <n.Icon className="lw-nav-ico" />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {calling && <CallOverlay onClose={() => setCalling(false)} />}
          {form && <SmartForm action={form} onClose={() => setForm(null)} />}
        </div>
      )}

      {!open && (
        <button className="lw-launcher" onClick={() => { setOpen(true); setTab("home"); }} aria-label="Abrir chat">
          <IconChat className="lw-launcher-ico" />
        </button>
      )}
    </div>
  );
}
