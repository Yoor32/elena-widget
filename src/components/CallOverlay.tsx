import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { CONFIG } from "../config";
import { chatSummary, getSessionId, loadHistory, ChatMsg } from "../lib/session";

type Line = { role: "user" | "agent"; text: string };

export function CallOverlay({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onDisconnect: onClose,
    onError: (e: unknown) => setError(String(e)),
    onMessage: (m: { message?: string; source?: string }) => {
      if (!m?.message) return;
      setLines(prev => [...prev, { role: m.source === "user" ? "user" : "agent", text: m.message as string }]);
    }
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const start = useCallback(async () => {
    setError(null);
    setLines([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const history = loadHistory() as ChatMsg[];
      await conversation.startSession({
        agentId: CONFIG.agentId,
        connectionType: "webrtc",
        dynamicVariables: {
          session_id: getSessionId(),
          resumen_chat: chatSummary(history),
          nombre_cliente: localStorage.getItem("elena_nombre") || ""
        }
      });
    } catch {
      setError("No se pudo iniciar la llamada. Revise el permiso del microfono.");
    }
  }, [conversation]);

  const status = conversation.status;
  const connected = status === "connected";

  return (
    <div className="lw-call-overlay">
      <button className="lw-call-back" onClick={onClose} aria-label="Volver al chat">X</button>
      <div className={`lw-orb ${connected ? (conversation.isSpeaking ? "speaking" : "listening") : ""}`} />
      <p className="lw-call-status">
        {connected
          ? conversation.isSpeaking ? `${CONFIG.brand.assistant} esta hablando...` : "Le escucho... (puede interrumpir)"
          : `Hablar con ${CONFIG.brand.assistant}`}
      </p>

      {connected && (
        <div className="lw-call-transcript">
          {lines.map((l, i) => (
            <div key={i} className={`lw-tline ${l.role === "user" ? "u" : "a"}`}>
              <span>{l.role === "user" ? "Tu" : CONFIG.brand.assistant}:</span> {l.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {error && <p className="lw-call-error">{error}</p>}

      {!connected ? (
        <button className="lw-call-start" onClick={start}>Iniciar llamada</button>
      ) : (
        <button className="lw-call-end" onClick={() => conversation.endSession()}>Colgar</button>
      )}
    </div>
  );
}
