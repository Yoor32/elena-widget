import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { CallOverlay } from "./components/CallOverlay";
import { CONFIG } from "./config";

export function App() {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);

  return (
    <div className="lw-root">
      {open && (
        <div className="lw-panel">
          <header className="lw-header">
            <div>
              <strong>{CONFIG.brand.assistant}</strong>
              <span className="lw-sub">{CONFIG.brand.name}</span>
            </div>
            <div className="lw-header-actions">
              <button
                className="lw-call-btn"
                title="Hablar con un asesor"
                onClick={() => setCalling(true)}
              >
                📞 Hablar con un asesor
              </button>
              <button className="lw-icon-btn" onClick={() => setOpen(false)}>✕</button>
            </div>
          </header>
          <ChatPanel />
          {calling && <CallOverlay onClose={() => setCalling(false)} />}
        </div>
      )}
      {!open && (
        <button className="lw-launcher" onClick={() => setOpen(true)} aria-label="Abrir chat">
          💬
        </button>
      )}
    </div>
  );
}
