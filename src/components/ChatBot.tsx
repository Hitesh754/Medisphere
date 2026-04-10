import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import intentsData from "@/data/intents.json";

type Intent = { tag: string; patterns: string[]; responses: string[] };
type Message = { role: "bot" | "user"; text: string; id: number };


function matchIntent(input: string): string {
  const normalised = input.toLowerCase().trim();
  const intents: Intent[] = (intentsData as { intents: Intent[] }).intents;

  
  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      const p = pattern.toLowerCase();
      
      if (normalised === p) return pickRandom(intent.responses);
      
      if (normalised.includes(p) || p.includes(normalised)) {
        const score = p.length;
        if (score > bestScore) { bestScore = score; best = intent; }
      }
      
      const inputWords = normalised.split(/\s+/);
      const patternWords = p.split(/\s+/);
      const overlap = inputWords.filter(w => patternWords.includes(w)).length;
      const score2 = overlap / patternWords.length;
      if (score2 > 0.5 && score2 * 100 > bestScore) {
        bestScore = score2 * 100; best = intent;
      }
    }
  }

  if (best) return pickRandom(best.responses);
  return "I'm not sure about that. Try asking about medication reminders, scanning prescriptions, uploading lab reports, or meal tracking! 💊";
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

let msgId = 0;
const uid = () => ++msgId;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi 👋 I'm MediBot! Ask me about medicines, reports, reminders, or health tips.", id: uid() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", text, id: uid() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = matchIntent(text);
      setTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: reply, id: uid() }]);
    }, 700 + Math.random() * 400);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes cb-slide-up   { from{opacity:0;transform:translateY(20px) scale(0.96);} to{opacity:1;transform:none;} }
        @keyframes cb-slide-down { from{opacity:1;transform:none;} to{opacity:0;transform:translateY(20px) scale(0.96);} }
        @keyframes cb-msg-in     { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:none;} }
        @keyframes cb-fab-in     { from{opacity:0;transform:scale(0.7) rotate(-15deg);} to{opacity:1;transform:scale(1) rotate(0);} }
        @keyframes cb-dot        { 0%,80%,100%{transform:translateY(0);opacity:0.35;} 40%{transform:translateY(-4px);opacity:1;} }
        @keyframes cb-ring       { 0%{box-shadow:0 0 0 0 rgba(59,130,246,0.5);} 70%{box-shadow:0 0 0 10px transparent;} 100%{box-shadow:0 0 0 0 transparent;} }
        @keyframes cb-shimmer    { 0%{background-position:-200% center;} 100%{background-position:200% center;} }

        .cb-wrap {
          position:fixed; bottom:84px; right:16px; z-index:60;
          display:flex; flex-direction:column; align-items:flex-end; gap:12px;
          font-family:'Plus Jakarta Sans',sans-serif;
        }

        /* ── FAB ── */
        .cb-fab {
          width:52px; height:52px; border-radius:50%; border:none; cursor:pointer;
          background:linear-gradient(135deg,#2563eb,#6366f1);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 28px rgba(37,99,235,0.38);
          transition:transform 0.22s cubic-bezier(0.22,0.68,0,1.2), box-shadow 0.22s;
          animation:cb-fab-in 0.4s cubic-bezier(0.22,0.68,0,1.2) both;
          position:relative; overflow:hidden;
        }
        .cb-fab::after {
          content:''; position:absolute; inset:0; border-radius:50%;
          background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);
        }
        .cb-fab:hover  { transform:scale(1.09); box-shadow:0 12px 36px rgba(37,99,235,0.48); }
        .cb-fab:active { transform:scale(0.94); }
        .cb-fab.has-notif { animation:cb-ring 2.2s ease-out infinite; }

        /* ── window ── */
        .cb-window {
          width:330px;
          border-radius:22px; overflow:hidden;
          background:#f8faff;
          border:1px solid rgba(59,130,246,0.14);
          box-shadow:0 20px 60px rgba(15,23,42,0.16), 0 4px 16px rgba(59,130,246,0.10);
          display:flex; flex-direction:column;
          animation:cb-slide-up 0.28s cubic-bezier(0.22,0.68,0,1.1) both;
        }

        /* ── header ── */
        .cb-header {
          padding:14px 16px 13px;
          background:linear-gradient(135deg,#1d4ed8,#4f46e5 55%,#7c3aed);
          display:flex; align-items:center; gap:11px;
          position:relative; overflow:hidden;
        }
        .cb-header::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
          background-size:200% 100%;
          animation:cb-shimmer 4s ease infinite;
        }
        .cb-header-ava {
          width:36px; height:36px; border-radius:12px; flex-shrink:0;
          background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28);
          display:flex; align-items:center; justify-content:center;
          position:relative; z-index:1;
        }
        .cb-header-text { flex:1; position:relative; z-index:1; }
        .cb-header-name { font-size:13.5px; font-weight:700; color:#fff; letter-spacing:-0.1px; }
        .cb-header-status { display:flex; align-items:center; gap:5px; margin-top:2px; }
        .cb-header-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.7); }
        .cb-header-online { font-size:10.5px; color:rgba(255,255,255,0.65); font-weight:500; }
        .cb-close-btn {
          width:28px; height:28px; border-radius:9px; border:none; cursor:pointer;
          background:rgba(255,255,255,0.15); color:#fff;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.18s, transform 0.18s;
          position:relative; z-index:1;
        }
        .cb-close-btn:hover  { background:rgba(255,255,255,0.25); transform:rotate(90deg); }
        .cb-close-btn:active { transform:scale(0.9) rotate(90deg); }

        /* ── messages ── */
        .cb-messages {
          flex:1; overflow-y:auto; padding:14px 13px;
          display:flex; flex-direction:column; gap:9px;
          max-height:320px;
          scrollbar-width:thin; scrollbar-color:rgba(59,130,246,0.2) transparent;
        }
        .cb-messages::-webkit-scrollbar { width:3px; }
        .cb-messages::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.2); border-radius:99px; }

        .cb-msg-row { display:flex; animation:cb-msg-in 0.24s cubic-bezier(0.22,0.68,0,1.1) both; }
        .cb-msg-row.user { justify-content:flex-end; }
        .cb-msg-row.bot  { justify-content:flex-start; }

        .cb-bubble {
          max-width:82%; padding:9px 13px;
          font-size:12.5px; line-height:1.55; font-weight:400;
          border-radius:16px; word-break:break-word;
        }
        .cb-bubble.user {
          background:linear-gradient(135deg,#2563eb,#6366f1);
          color:#fff;
          border-bottom-right-radius:5px;
          box-shadow:0 4px 14px rgba(37,99,235,0.28);
        }
        .cb-bubble.bot {
          background:#fff;
          color:#1e293b;
          border-bottom-left-radius:5px;
          border:1px solid rgba(59,130,246,0.11);
          box-shadow:0 2px 8px rgba(15,23,42,0.06);
        }

        /* ── typing ── */
        .cb-typing {
          display:flex; align-items:center; gap:4px;
          padding:10px 14px;
          background:#fff; border-radius:16px; border-bottom-left-radius:5px;
          border:1px solid rgba(59,130,246,0.11);
          width:54px;
          box-shadow:0 2px 8px rgba(15,23,42,0.06);
          animation:cb-msg-in 0.24s ease both;
        }
        .cb-typing span {
          width:5px; height:5px; border-radius:50%; background:#93c5fd;
          animation:cb-dot 1.2s ease-in-out infinite;
        }
        .cb-typing span:nth-child(2) { animation-delay:0.16s; }
        .cb-typing span:nth-child(3) { animation-delay:0.32s; }

        /* ── input bar ── */
        .cb-input-bar {
          padding:11px 12px;
          border-top:1px solid rgba(59,130,246,0.09);
          background:#fff;
          display:flex; align-items:center; gap:8px;
        }
        .cb-input {
          flex:1; background:#f1f5ff; border:1px solid rgba(59,130,246,0.14);
          border-radius:12px; padding:9px 13px;
          font-size:12.5px; font-family:'Plus Jakarta Sans',sans-serif;
          color:#1e293b; outline:none;
          transition:border-color 0.18s, box-shadow 0.18s;
        }
        .cb-input::placeholder { color:rgba(30,41,59,0.38); }
        .cb-input:focus { border-color:rgba(37,99,235,0.4); box-shadow:0 0 0 3px rgba(37,99,235,0.10); }
        .cb-send {
          width:36px; height:36px; border-radius:11px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#2563eb,#6366f1);
          color:#fff; display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
          box-shadow:0 4px 12px rgba(37,99,235,0.30);
          transition:transform 0.18s cubic-bezier(0.22,0.68,0,1.2), box-shadow 0.18s;
        }
        .cb-send:hover  { transform:scale(1.08) translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,0.40); }
        .cb-send:active { transform:scale(0.94); }
        .cb-send:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

        /* ── quick chips ── */
        .cb-chips {
          padding:0 12px 10px;
          display:flex; flex-wrap:wrap; gap:6px;
          background:#fff;
        }
        .cb-chip {
          font-size:11px; font-weight:600; padding:4px 11px; border-radius:100px;
          border:1px solid rgba(59,130,246,0.22); background:rgba(59,130,246,0.06);
          color:#2563eb; cursor:pointer;
          transition:background 0.18s, transform 0.18s;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .cb-chip:hover  { background:rgba(59,130,246,0.14); transform:translateY(-1px); }
        .cb-chip:active { transform:scale(0.96); }
      `}</style>

      <div className="cb-wrap">
        {open && (
          <div className="cb-window">
            
            <div className="cb-header">
              <div className="cb-header-ava">
                <Sparkles size={17} color="#fff" />
              </div>
              <div className="cb-header-text">
                <div className="cb-header-name">MediBot</div>
                <div className="cb-header-status">
                  <span className="cb-header-dot" />
                  <span className="cb-header-online">Always here to help</span>
                </div>
              </div>
              <button className="cb-close-btn" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>

            
            <div className="cb-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`cb-msg-row ${msg.role}`}>
                  <div className={`cb-bubble ${msg.role}`}>{msg.text}</div>
                </div>
              ))}
              {typing && (
                <div className="cb-msg-row bot">
                  <div className="cb-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            
            <div className="cb-chips">
              {["My medicines", "Missed dose?", "Scan Rx", "Lab reports"].map((chip) => (
                <button
                  key={chip}
                  className="cb-chip"
                  onClick={() => {
                    setInput(chip);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { role: "user", text: chip, id: uid() }]);
                      setInput("");
                      setTyping(true);
                      setTimeout(() => {
                        setTyping(false);
                        setMessages(prev => [...prev, { role: "bot", text: matchIntent(chip), id: uid() }]);
                      }, 700);
                    }, 0);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            
            <div className="cb-input-bar">
              <input
                className="cb-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about medicines..."
              />
              <button className="cb-send" onClick={handleSend} disabled={!input.trim()}>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        
        <button className="cb-fab" onClick={() => setOpen((o) => !o)} aria-label="Open chat">
          {open ? <X size={20} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
        </button>
      </div>
    </>
  );
}
