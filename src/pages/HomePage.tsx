// I have to add two features in future one is medilocker one and the other is login page (Kevin-47) 
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill, Upload, Clock, Calendar,
  CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle,
  Activity, Heart,
} from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import {
  getSavedMedicines,
  getScheduleTimes,
  isMedicineTakenToday,
  markMedicineTaken,
  unmarkMedicineTaken,
  getTodayAdherenceStats,
  getExpiringMedicines,
  type SavedMedicine,
} from "@/lib/medicineStore";
import { useMedicineNotifications } from "@/hooks/useMedicineNotifications";
import { toast } from "sonner";

const mockUser = { name: "John" };


function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}


function ripple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const span = document.createElement("span");
  const d = Math.max(el.clientWidth, el.clientHeight);
  const r = el.getBoundingClientRect();
  span.style.cssText = `position:absolute;width:${d}px;height:${d}px;
    left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px;
    background:rgba(255,255,255,0.22);border-radius:50%;
    transform:scale(0);animation:hp-ripple .55s ease-out;pointer-events:none;`;
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove());
}

export default function HomePage() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<SavedMedicine[]>([]);
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useMedicineNotifications();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌤️" : hour < 18 ? "☀️" : "🌙";

  const reload = useCallback(() => { setMedicines(getSavedMedicines()); setTick((t) => t + 1); }, []);

  useEffect(() => {
    reload();
    const t = setTimeout(() => setMounted(true), 80);
    window.addEventListener("medicines-updated", reload);
    window.addEventListener("adherence-updated", reload);
    return () => { clearTimeout(t); window.removeEventListener("medicines-updated", reload); window.removeEventListener("adherence-updated", reload); };
  }, [reload]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const medications = medicines.length > 0
    ? medicines.flatMap((med) => {
        const times = getScheduleTimes(med.frequency);
        return times.map((t) => {
          const h = parseInt(t.split(":")[0], 10);
          const m = parseInt(t.split(":")[1], 10);
          const scheduleMinutes = h * 60 + m;
          const taken = isMedicineTakenToday(med.name, med.dosage, t);
          const isPast = currentMinutes > scheduleMinutes + 30;
          return {
            id: `${med.name}-${t}`,
            name: `${med.name} ${med.dosage}`,
            medName: med.name, dosage: med.dosage, scheduleTime: t, scheduleMinutes,
            time: `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${t.split(":")[1]} ${h >= 12 ? "PM" : "AM"}`,
            taken,
            status: taken ? "taken" : isPast ? "missed" : Math.abs(currentMinutes - scheduleMinutes) <= 30 ? "now" : "upcoming",
          };
        });
      }).sort((a, b) => a.scheduleMinutes - b.scheduleMinutes)
    : [];

  const stats = getTodayAdherenceStats();
  const expiring = getExpiringMedicines();
  const animatedPct = useCountUp(mounted ? stats.percentage : 0);

  const handleToggleTaken = (medName: string, dosage: string, scheduleTime: string, currentlyTaken: boolean) => {
    if (currentlyTaken) { unmarkMedicineTaken(medName, dosage, scheduleTime); }
    else { markMedicineTaken(medName, dosage, scheduleTime); toast.success(`✓ Marked ${medName} as taken`); }
    reload();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @keyframes hp-ripple    { to { transform:scale(4); opacity:0; } }
        @keyframes hp-fade-up   { from{opacity:0;transform:translateY(18px);}  to{opacity:1;transform:none;} }
        @keyframes hp-badge-in  { from{opacity:0;transform:translateX(-8px);}  to{opacity:1;transform:none;} }
        @keyframes hp-pop-in    { 0%{opacity:0;transform:scale(0.88);} 60%{transform:scale(1.03);} 100%{opacity:1;transform:scale(1);} }
        @keyframes hp-float     { 0%,100%{transform:translateY(0) rotate(0deg);} 33%{transform:translateY(-7px) rotate(1deg);} 66%{transform:translateY(-3px) rotate(-0.8deg);} }
        @keyframes hp-orb-drift { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(14px,-18px) scale(1.06);} 66%{transform:translate(-10px,10px) scale(0.95);} }
        @keyframes hp-pulse-ring{ 0%{box-shadow:0 0 0 0 rgba(59,130,246,0.42);} 70%{box-shadow:0 0 0 12px transparent;} 100%{box-shadow:0 0 0 0 transparent;} }
        @keyframes hp-ping      { 0%{transform:scale(1);opacity:0.8;} 100%{transform:scale(1.55);opacity:0;} }
        @keyframes hp-shimmer   { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes hp-bar-grow  { from{width:0;} }
        @keyframes hp-glow-bar  { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

        .hp {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: #EEF3FB;
          position: relative; overflow-x: hidden;
          color: #111827;
        }

        .hp-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
        .hp-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(59,130,246,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.045) 1px, transparent 1px);
          background-size:52px 52px;
          mask-image:radial-gradient(ellipse 85% 85% at 50% 40%, black 25%, transparent 100%);
        }
        .hp-orb {
          position:absolute; border-radius:50%; filter:blur(80px);
          animation: hp-orb-drift 14s ease-in-out infinite;
        }
        .hp-orb-1 { width:400px;height:400px; top:-120px;right:-90px;  background:radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%); animation-delay:0s; }
        .hp-orb-2 { width:300px;height:300px; top:480px;left:-110px;   background:radial-gradient(circle,rgba(99,102,241,0.11) 0%,transparent 70%); animation-delay:-5s; }
        .hp-orb-3 { width:240px;height:240px; bottom:200px;right:-60px; background:radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 70%); animation-delay:-9s; }

        .hp-content {
          position:relative; z-index:1;
          padding:56px 20px 110px;
          display:flex; flex-direction:column; gap:22px;
          max-width:540px; margin:0 auto;
        }

        .hp-reveal { opacity:0; animation:hp-fade-up 0.48s cubic-bezier(0.22,0.68,0,1.1) forwards; }

        .hp-chip {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 12px 4px 8px; border-radius:100px;
          background:rgba(59,130,246,0.10); border:1px solid rgba(59,130,246,0.22);
          font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
          color:#2563eb; margin-bottom:11px;
          opacity:0; animation:hp-badge-in 0.55s 0.15s ease forwards;
        }
        .hp-chip-dot {
          width:6px; height:6px; border-radius:50%;
          background:#3b82f6; box-shadow:0 0 6px rgba(59,130,246,0.7);
          animation:hp-pulse-ring 2s ease-out infinite;
        }
        .hp-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .hp-greeting {
          font-family:'Fraunces',serif;
          font-size:30px; font-weight:800; color:#0f172a;
          line-height:1.1; letter-spacing:-0.7px; margin-bottom:5px;
        }
        .hp-greeting span {
          background:linear-gradient(135deg,#2563eb,#7c3aed);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .hp-subline { font-size:12.5px; font-weight:400; color:rgba(15,23,42,0.48); }

        /* ProfileMenu container alignment */
        .hp-profile-menu-wrap {
          flex-shrink:0;
          opacity:0; animation:hp-fade-up 0.48s 0.08s ease forwards;
        }

        .hp-section-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:13px; }
        .hp-section-label {
          font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;
          color:rgba(15,23,42,0.38);display:flex;align-items:center;gap:8px;
        }
        .hp-section-label::before {
          content:'';display:block;width:3px;height:13px;border-radius:99px;
          background:linear-gradient(180deg,#3b82f6,#6366f1);
        }
        .hp-section-badge {
          font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:100px;
          background:rgba(245,158,11,0.09);color:#d97706;border:1px solid rgba(245,158,11,0.18);
        }

        .hp-actions { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .hp-action {
          border-radius:22px;padding:20px 16px 18px;
          display:flex;flex-direction:column;gap:16px;
          cursor:pointer;border:1.5px solid transparent;
          position:relative;overflow:hidden;
          transition:transform 0.22s cubic-bezier(0.22,0.68,0,1.2),box-shadow 0.22s;
        }
        .hp-action::before {
          content:'';position:absolute;top:0;left:0;right:0;height:50%;
          background:linear-gradient(180deg,rgba(255,255,255,0.16),transparent);
          border-radius:22px 22px 0 0;pointer-events:none;
        }
        .hp-action:hover  { transform:translateY(-3px) scale(1.015); }
        .hp-action:active { transform:scale(0.97); }
        .hp-action-scan {
          background:linear-gradient(148deg,rgba(37,99,235,0.13) 0%,rgba(99,102,241,0.07) 100%);
          border-color:rgba(37,99,235,0.22);
          box-shadow:0 5px 24px rgba(37,99,235,0.10);
        }
        .hp-action-upload {
          background:linear-gradient(148deg,rgba(124,58,237,0.12) 0%,rgba(139,92,246,0.06) 100%);
          border-color:rgba(124,58,237,0.20);
          box-shadow:0 5px 24px rgba(124,58,237,0.08);
        }
        .hp-action-icon-cluster { display:flex;align-items:flex-end;gap:7px; }
        .hp-action-ico-main {
          width:48px;height:48px;border-radius:16px;
          display:flex;align-items:center;justify-content:center;
          position:relative;
        }
        .hp-action-scan   .hp-action-ico-main { background:rgba(37,99,235,0.18);box-shadow:0 6px 18px rgba(37,99,235,0.18); }
        .hp-action-upload .hp-action-ico-main { background:rgba(124,58,237,0.16);box-shadow:0 6px 18px rgba(124,58,237,0.16); }
        .hp-action-ico-side {
          width:26px;height:26px;border-radius:9px;margin-bottom:2px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.6);
        }
        .hp-action-name { font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#0f172a;line-height:1.2;letter-spacing:-0.2px; }
        .hp-action-hint { font-size:11px;font-weight:400;margin-top:2px; }
        .hp-action-scan   .hp-action-hint { color:rgba(37,99,235,0.7); }
        .hp-action-upload .hp-action-hint { color:rgba(124,58,237,0.7); }

        .hp-alert {
          display:flex;align-items:flex-start;gap:11px;border-radius:16px;padding:13px 15px;
          animation:hp-pop-in 0.35s cubic-bezier(0.22,0.68,0,1.2) both;
        }
        .hp-alert-expired { background:rgba(239,68,68,0.06);  border:1.5px solid rgba(239,68,68,0.17); }
        .hp-alert-warn    { background:rgba(245,158,11,0.06); border:1.5px solid rgba(245,158,11,0.17); }
        .hp-alert-title { font-family:'Fraunces',serif;font-size:13px;font-weight:700;color:#0f172a; }
        .hp-alert-body  { font-size:11px;color:rgba(15,23,42,0.5);margin-top:2px; }

        .hp-divider { display:flex;align-items:center;gap:10px; }
        .hp-divider-line { flex:1;height:1px;background:rgba(15,23,42,0.08); }
        .hp-divider-lbl { font-size:9.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:rgba(15,23,42,0.28); }

        .hp-adhere {
          border-radius:24px;padding:24px 22px;position:relative;overflow:hidden;
          background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 48%,#7c3aed 100%);
          box-shadow:0 14px 44px rgba(29,78,216,0.30),0 2px 8px rgba(29,78,216,0.18),inset 0 1px 0 rgba(255,255,255,0.16);
          opacity:0; animation:hp-fade-up 0.5s ease forwards;
        }
        .hp-adhere::before { content:'';position:absolute;width:200px;height:200px;border-radius:50%;top:-60px;right:-50px;background:rgba(255,255,255,0.08);pointer-events:none; }
        .hp-adhere::after  { content:'';position:absolute;width:130px;height:130px;border-radius:50%;bottom:-40px;left:-30px;background:rgba(255,255,255,0.05);pointer-events:none; }
        .hp-adhere-shine {
          position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);
          animation:hp-shimmer 3s ease infinite;background-size:200% 100%;
        }
        .hp-adhere-inner { position:relative;z-index:1; }
        .hp-adhere-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
        .hp-adhere-eyebrow { font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.58);margin-bottom:5px; }
        .hp-adhere-title { font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.3px; }
        .hp-adhere-sub   { font-size:11px;font-weight:400;color:rgba(255,255,255,0.55);margin-top:4px; }
        .hp-adhere-pct   {
          font-family:'Fraunces',serif;font-size:52px;font-weight:800;color:#fff;
          letter-spacing:-2.5px;line-height:1;text-shadow:0 2px 16px rgba(0,0,0,0.14);
        }
        .hp-track { width:100%;height:6px;background:rgba(255,255,255,0.18);border-radius:99px;overflow:hidden;margin-bottom:12px; }
        .hp-fill  {
          height:100%;border-radius:99px;
          background:linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.55));
          box-shadow:0 0 14px rgba(255,255,255,0.4);
          transition:width 1.1s cubic-bezier(0.4,0,0.2,1);
        }
        .hp-adhere-note { font-size:12px;font-weight:400;color:rgba(255,255,255,0.62); }
        .hp-adhere-note b { color:#fff;font-weight:700; }

        .hp-med-empty {
          border-radius:22px;padding:44px 20px;text-align:center;
          background:rgba(255,255,255,0.78);
          border:1.5px dashed rgba(59,130,246,0.22);
          backdrop-filter:blur(12px);
          box-shadow:0 4px 20px rgba(59,130,246,0.06);
        }
        .hp-med-empty-cluster {
          display:flex;align-items:flex-end;justify-content:center;gap:10px;margin-bottom:16px;
          animation:hp-float 4s ease-in-out infinite;
        }
        .hp-med-empty-side {
          width:36px;height:36px;border-radius:12px;
          background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.12);
          display:flex;align-items:center;justify-content:center;
        }
        .hp-med-empty-main {
          width:60px;height:60px;border-radius:20px;
          background:linear-gradient(135deg,#2563eb,#6366f1);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 8px 24px rgba(37,99,235,0.30);
          position:relative;
        }
        .hp-med-empty-ring {
          position:absolute;inset:-6px;border-radius:26px;
          border:1.5px solid rgba(59,130,246,0.22);
          animation:hp-ping 2s ease-out infinite;
        }
        .hp-med-empty-t  { font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#0f172a; }
        .hp-med-empty-st { font-size:12px;color:rgba(15,23,42,0.42);margin-top:5px; }

        .hp-med-list { display:flex;flex-direction:column;gap:10px; }
        .hp-med {
          background:#fff;
          border:1px solid rgba(15,23,42,0.07);
          border-radius:20px;padding:15px 15px 15px 18px;
          display:flex;align-items:center;gap:13px;
          position:relative;overflow:hidden;
          box-shadow:0 2px 10px rgba(15,23,42,0.05);
          transition:transform 0.2s cubic-bezier(0.22,0.68,0,1.2),box-shadow 0.2s,border-color 0.2s;
        }
        .hp-med::after {
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(59,130,246,0.18),transparent);
        }
        .hp-med::before {
          content:'';position:absolute;left:0;top:14px;bottom:14px;
          width:3px;border-radius:99px;background:transparent;transition:background 0.22s;
        }
        .hp-med.taken  { background:rgba(16,185,129,0.04);border-color:rgba(16,185,129,0.17); }
        .hp-med.missed { background:rgba(239,68,68,0.04); border-color:rgba(239,68,68,0.15); }
        .hp-med.now    { border-color:rgba(59,130,246,0.35);box-shadow:0 0 0 3px rgba(59,130,246,0.09),0 2px 10px rgba(59,130,246,0.07); }
        .hp-med.taken::before  { background:#10b981; }
        .hp-med.missed::before { background:#ef4444; }
        .hp-med.now::before    { background:#3b82f6;animation:hp-glow-bar 1.6s ease-in-out infinite; }
        .hp-med:hover  { transform:translateX(3px);box-shadow:0 4px 20px rgba(59,130,246,0.08); }

        .hp-med-ico-btn {
          width:42px;height:42px;border-radius:14px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          border:none;cursor:pointer;
          transition:transform 0.18s cubic-bezier(0.22,0.68,0,1.2);
          position:relative;overflow:hidden;
        }
        .hp-med-ico-btn:active { transform:scale(0.86) rotate(-7deg); }
        .hp-med-ico-btn.taken    { background:rgba(16,185,129,0.13); }
        .hp-med-ico-btn.missed   { background:rgba(239,68,68,0.10); }
        .hp-med-ico-btn.upcoming { background:rgba(245,158,11,0.12); }
        .hp-med-ico-btn.now      { background:rgba(59,130,246,0.13);animation:hp-pulse-ring 2s infinite; }

        .hp-med-test { font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:rgba(15,23,42,0.35);margin-bottom:3px; }
        .hp-med-name {
          font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#0f172a;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.1px;
        }
        .hp-med-name.taken { text-decoration:line-through;color:rgba(15,23,42,0.38); }
        .hp-med-row { display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap; }
        .hp-med-time { font-size:11px;color:rgba(15,23,42,0.42); }

        .hp-status-pill {
          font-size:9.5px;font-weight:700;letter-spacing:0.05em;padding:2px 9px;border-radius:100px;
          animation:hp-pop-in 0.3s cubic-bezier(0.22,0.68,0,1.2) both;
        }
        .hp-status-pill.now    { background:rgba(59,130,246,0.11);color:#2563eb; }
        .hp-status-pill.missed { background:rgba(239,68,68,0.10); color:#dc2626; }

        .hp-mark-btn {
          font-size:11.5px;font-weight:700;padding:7px 14px;border-radius:100px;
          border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;letter-spacing:0.01em;
          position:relative;overflow:hidden;
          transition:transform 0.18s cubic-bezier(0.22,0.68,0,1.2),box-shadow 0.18s;
        }
        .hp-mark-btn::after {
          content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          background-size:200% 100%;opacity:0;transition:opacity 0.3s;
        }
        .hp-mark-btn.taken   { background:rgba(16,185,129,0.11);color:#059669; }
        .hp-mark-btn.pending {
          background:linear-gradient(135deg,#2563eb,#6366f1);color:#fff;
          box-shadow:0 4px 14px rgba(37,99,235,0.32);
        }
        .hp-mark-btn.pending:hover  { transform:translateY(-2px);box-shadow:0 7px 20px rgba(37,99,235,0.42); }
        .hp-mark-btn.pending:hover::after { opacity:1;animation:hp-shimmer 0.85s ease; }
        .hp-mark-btn.pending:active { transform:scale(0.95); }

        .hp-appt {
          border-radius:22px;padding:20px;
          display:flex;align-items:center;gap:16px;
          background:#fff;border:1px solid rgba(15,23,42,0.07);
          cursor:pointer;position:relative;overflow:hidden;
          box-shadow:0 2px 10px rgba(15,23,42,0.05);
          transition:transform 0.22s cubic-bezier(0.22,0.68,0,1.2),box-shadow 0.22s,border-color 0.22s;
        }
        .hp-appt::before {
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(244,63,94,0.3),transparent);
        }
        .hp-appt-inner-glow {
          position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(244,63,94,0.04),rgba(236,72,153,0.03));
          opacity:0;transition:opacity 0.3s;
        }
        .hp-appt:hover .hp-appt-inner-glow { opacity:1; }
        .hp-appt:hover  { transform:translateY(-3px);box-shadow:0 12px 36px rgba(244,63,94,0.11);border-color:rgba(244,63,94,0.20); }
        .hp-appt:active { transform:scale(0.98); }
        .hp-appt-ico {
          width:52px;height:52px;border-radius:17px;flex-shrink:0;
          background:linear-gradient(135deg,#f43f5e,#ec4899);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 7px 22px rgba(244,63,94,0.28);
          transition:transform 0.22s cubic-bezier(0.22,0.68,0,1.2);
          position:relative;z-index:1;
        }
        .hp-appt:hover .hp-appt-ico { transform:rotate(-6deg) scale(1.08); }
        .hp-appt-title { font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#0f172a;letter-spacing:-0.1px; }
        .hp-appt-sub   { font-size:11.5px;color:rgba(15,23,42,0.43);margin-top:3px; }
        .hp-appt-arr   { font-size:18px;color:rgba(244,63,94,0.4);flex-shrink:0;transition:transform 0.2s;position:relative;z-index:1; }
        .hp-appt:hover .hp-appt-arr { transform:translateX(5px); }

        .hp-disclaimer {
          border-radius:15px;padding:12px 14px;
          background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.18);
          display:flex;align-items:flex-start;gap:9px;
        }
        .hp-disclaimer-text { font-size:11px;color:rgba(15,23,42,0.47);line-height:1.65; }
      `}</style>

      
      <div className="hp-bg" aria-hidden>
        <div className="hp-grid" />
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />
        <div className="hp-orb hp-orb-3" />
      </div>

      <div className="hp">
        <div className="hp-content">

          
          <div className="hp-reveal" style={{ animationDelay: "0ms" }}>
            <div className="hp-chip">
              <span className="hp-chip-dot" />
              {greetingEmoji} {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div className="hp-header-row">
              <div>
                <div className="hp-greeting">
                  {greeting},<br />
                  <span>{mockUser.name}</span> 👋
                </div>
                <div className="hp-subline">How are you feeling today?</div>
              </div>

              
              <div className="hp-profile-menu-wrap">
                <ProfileMenu />
              </div>
            </div>
          </div>

          
          <div className="hp-reveal" style={{ animationDelay: "80ms" }}>
            <div className="hp-section-head"><div className="hp-section-label">Quick Actions</div></div>
            <div className="hp-actions">
              <div className="hp-action hp-action-scan" onClick={(e) => { ripple(e); navigate("/prescriptions"); }}>
                <div className="hp-action-icon-cluster">
                  <div className="hp-action-ico-side"><Activity size={13} color="rgba(37,99,235,0.45)" /></div>
                  <div className="hp-action-ico-main"><Pill size={22} color="#2563eb" /></div>
                </div>
                <div>
                  <div className="hp-action-name">Scan Prescription</div>
                  <div className="hp-action-hint">AI-powered scan</div>
                </div>
              </div>
              <div className="hp-action hp-action-upload" onClick={(e) => { ripple(e); navigate("/medilocker"); }}>
                <div className="hp-action-icon-cluster">
                  <div className="hp-action-ico-side"><Heart size={13} color="rgba(124,58,237,0.45)" /></div>
                  <div className="hp-action-ico-main"><Upload size={22} color="#7c3aed" /></div>
                </div>
                <div>
                  <div className="hp-action-name">Upload Lab Report</div>
                  <div className="hp-action-hint">Store securely</div>
                </div>
              </div>
            </div>
          </div>

          
          {expiring.length > 0 && (
            <div className="hp-reveal" style={{ animationDelay: "130ms", display: "flex", flexDirection: "column", gap: "9px" }}>
              {expiring.map((alert, i) => (
                <div key={i} className={`hp-alert ${alert.daysLeft <= 0 ? "hp-alert-expired" : "hp-alert-warn"}`} style={{ animationDelay: `${i * 55}ms` }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} color={alert.daysLeft <= 0 ? "#ef4444" : "#f59e0b"} />
                  <div>
                    <div className="hp-alert-title">{alert.name} {alert.dosage}</div>
                    <div className="hp-alert-body">
                      {alert.daysLeft <= 0 ? "Course completed — consult your doctor before continuing"
                        : alert.daysLeft === 1 ? "Last day of course — refill or consult doctor"
                        : `${alert.daysLeft} days left in course`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          <div className="hp-divider hp-reveal" style={{ animationDelay: "148ms" }}>
            <div className="hp-divider-line" />
            <span className="hp-divider-lbl">Daily Overview</span>
            <div className="hp-divider-line" />
          </div>

          
          {medicines.length > 0 && (
            <div className="hp-adhere" style={{ animationDelay: "165ms" }}>
              <div className="hp-adhere-shine" />
              <div className="hp-adhere-inner">
                <div className="hp-adhere-top">
                  <div>
                    <div className="hp-adhere-eyebrow">Daily Progress</div>
                    <div className="hp-adhere-title">Today's Adherence</div>
                    <div className="hp-adhere-sub">Keep up the streak 🔥</div>
                  </div>
                  <div className="hp-adhere-pct">{animatedPct}%</div>
                </div>
                <div className="hp-track">
                  <div className="hp-fill" style={{ width: `${stats.percentage}%` }} />
                </div>
                <div className="hp-adhere-note"><b>{stats.taken}</b> of <b>{stats.total}</b> doses taken today</div>
              </div>
            </div>
          )}

          
          <div className="hp-divider hp-reveal" style={{ animationDelay: "195ms" }}>
            <div className="hp-divider-line" />
            <span className="hp-divider-lbl">Medication Schedule</span>
            <div className="hp-divider-line" />
          </div>

          
          <div className="hp-reveal" style={{ animationDelay: "215ms" }}>
            <div className="hp-section-head">
              <div className="hp-section-label">Medication Reminders</div>
              {medications.filter((m) => !m.taken).length > 0 && (
                <div className="hp-section-badge">{medications.filter((m) => !m.taken).length} pending</div>
              )}
            </div>

            {medications.length === 0 ? (
              <div className="hp-med-empty">
                <div className="hp-med-empty-cluster">
                  <div className="hp-med-empty-side"><Activity size={15} color="rgba(59,130,246,0.4)" /></div>
                  <div className="hp-med-empty-main">
                    <div className="hp-med-empty-ring" />
                    <Pill size={26} color="#fff" />
                  </div>
                  <div className="hp-med-empty-side"><Clock size={15} color="rgba(59,130,246,0.4)" /></div>
                </div>
                <div className="hp-med-empty-t">Scan a prescription</div>
                <div className="hp-med-empty-st">to see your medicines here</div>
              </div>
            ) : (
              <div className="hp-med-list">
                {medications.map((med, idx) => (
                  <div
                    key={med.id}
                    className={`hp-med hp-reveal ${med.taken ? "taken" : med.status === "missed" ? "missed" : med.status === "now" ? "now" : ""}`}
                    style={{ animationDelay: `${215 + idx * 52}ms` }}
                  >
                    <button
                      onClick={() => handleToggleTaken(med.medName, med.dosage, med.scheduleTime, med.taken)}
                      className={`hp-med-ico-btn ${med.taken ? "taken" : med.status === "missed" ? "missed" : med.status === "now" ? "now" : "upcoming"}`}
                    >
                      {med.taken ? <CheckCircle2 size={18} color="#10b981" />
                        : med.status === "missed" ? <Pill size={16} color="#ef4444" />
                        : med.status === "now"    ? <Pill size={16} color="#3b82f6" />
                        :                           <Pill size={16} color="#f59e0b" />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="hp-med-test">Medicine</div>
                      <div className={`hp-med-name ${med.taken ? "taken" : ""}`}>{med.name}</div>
                      <div className="hp-med-row">
                        <Clock size={10} color="rgba(15,23,42,0.35)" />
                        <span className="hp-med-time">{med.time}</span>
                        {med.status === "now"    && !med.taken && <span className="hp-status-pill now">NOW</span>}
                        {med.status === "missed" && !med.taken && <span className="hp-status-pill missed">MISSED</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { ripple(e); handleToggleTaken(med.medName, med.dosage, med.scheduleTime, med.taken); }}
                      className={`hp-mark-btn ${med.taken ? "taken" : "pending"}`}
                    >
                      {med.taken ? "✓ Taken" : "Mark Taken"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="hp-divider hp-reveal" style={{ animationDelay: "310ms" }}>
            <div className="hp-divider-line" />
            <span className="hp-divider-lbl">Consultation</span>
            <div className="hp-divider-line" />
          </div>

          
          <div className="hp-reveal" style={{ animationDelay: "330ms" }}>
            <div className="hp-appt" onClick={() => navigate("/appointment")}>
              <div className="hp-appt-inner-glow" />
              <div className="hp-appt-ico"><Calendar size={23} color="#fff" /></div>
              <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                <div className="hp-appt-title">Book an Appointment</div>
                <div className="hp-appt-sub">Schedule a visit &amp; share health summary via QR</div>
              </div>
              <div className="hp-appt-arr">→</div>
            </div>
          </div>

          
          <div className="hp-disclaimer hp-reveal" style={{ animationDelay: "360ms" }}>
            <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <span className="hp-disclaimer-text">
              Medication info is for tracking purposes only. Always follow your doctor's instructions.
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
