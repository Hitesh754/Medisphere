// have to do some more changes here (Kevin-47)
import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar, Stethoscope, Share2, Copy,
  Clock, CheckCircle, Sparkles, Activity, Heart,
} from "lucide-react";
import { getSavedMedicines, getTodayAdherenceStats } from "@/lib/medicineStore";
import { toast } from "sonner";

export default function AppointmentPage() {
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [booked, setBooked] = useState(false);

  const healthSummary = useMemo(() => {
    const meds = getSavedMedicines();
    const stats = getTodayAdherenceStats();
    const summary: Record<string, string> = {
      generatedAt: new Date().toISOString(),
      patientMedicines:
        meds.map((m) => `${m.name} ${m.dosage} (${m.frequency}, ${m.duration})`).join("; ") || "None",
      todayAdherence: `${stats.taken}/${stats.total} doses (${stats.percentage}%)`,
    };
    if (doctorName) summary.appointmentWith = doctorName;
    if (date) summary.appointmentDate = date;
    if (time) summary.appointmentTime = time;
    return JSON.stringify(summary);
  }, [doctorName, date, time]);

  const handleBook = () => {
    if (!doctorName || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }
    setBooked(true);
    toast.success("Appointment booked!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(healthSummary);
    toast.success("Health summary copied!");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        /* ── keyframes ── */
        @keyframes ap-fade-up   { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:none;} }
        @keyframes ap-badge-in  { from{opacity:0;transform:translateX(-8px);} to{opacity:1;transform:none;} }
        @keyframes ap-pop-in    { 0%{opacity:0;transform:scale(0.88);} 60%{transform:scale(1.04);} 100%{opacity:1;transform:scale(1);} }
        @keyframes ap-float     { 0%,100%{transform:translateY(0) rotate(0deg);} 33%{transform:translateY(-7px) rotate(1deg);} 66%{transform:translateY(-3px) rotate(-0.8deg);} }
        @keyframes ap-orb-drift { 0%,100%{transform:translate(0,0) scale(1);} 35%{transform:translate(16px,-20px) scale(1.06);} 68%{transform:translate(-12px,11px) scale(0.95);} }
        @keyframes ap-pulse-ring{ 0%{box-shadow:0 0 0 0 rgba(244,63,94,0.40);} 70%{box-shadow:0 0 0 12px transparent;} 100%{box-shadow:0 0 0 0 transparent;} }
        @keyframes ap-ping      { 0%{transform:scale(1);opacity:0.75;} 100%{transform:scale(1.6);opacity:0;} }
        @keyframes ap-shimmer   { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes ap-spin      { to{transform:rotate(360deg);} }
        @keyframes ap-check-pop { 0%{transform:scale(0) rotate(-15deg);opacity:0;} 60%{transform:scale(1.2) rotate(5deg);} 100%{transform:scale(1) rotate(0);opacity:1;} }
        @keyframes ap-glow-line { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
        @keyframes ap-slide-in  { from{opacity:0;transform:translateY(24px) scale(0.97);} to{opacity:1;transform:none;} }

        /* ── root ── */
        .ap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: #FDF0F2;
          position: relative; overflow-x: hidden;
          color: #111827;
        }

        /* ── ambient bg ── */
        .ap-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
        .ap-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(244,63,94,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244,63,94,0.045) 1px, transparent 1px);
          background-size:52px 52px;
          mask-image:radial-gradient(ellipse 85% 85% at 50% 40%, black 25%, transparent 100%);
        }
        .ap-orb {
          position:absolute; border-radius:50%; filter:blur(80px);
          animation: ap-orb-drift 14s ease-in-out infinite;
        }
        .ap-orb-1 { width:380px;height:380px; top:-110px;right:-80px;  background:radial-gradient(circle,rgba(244,63,94,0.16) 0%,transparent 70%); animation-delay:0s; }
        .ap-orb-2 { width:300px;height:300px; top:500px;left:-110px;   background:radial-gradient(circle,rgba(236,72,153,0.11) 0%,transparent 70%); animation-delay:-5s; }
        .ap-orb-3 { width:230px;height:230px; bottom:180px;right:-55px; background:radial-gradient(circle,rgba(251,113,133,0.09) 0%,transparent 70%); animation-delay:-9s; }

        /* ── layout ── */
        .ap-content {
          position:relative; z-index:1;
          padding:56px 20px 110px;
          display:flex; flex-direction:column; gap:22px;
          max-width:540px; margin:0 auto;
        }

        /* ── reveal ── */
        .ap-reveal { opacity:0; animation:ap-fade-up 0.48s cubic-bezier(0.22,0.68,0,1.1) forwards; }

        /* ─────────── HEADER ─────────── */
        .ap-chip {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 12px 4px 8px; border-radius:100px;
          background:rgba(244,63,94,0.10); border:1px solid rgba(244,63,94,0.22);
          font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
          color:#e11d48; margin-bottom:11px;
          opacity:0; animation:ap-badge-in 0.55s 0.15s ease forwards;
        }
        .ap-chip-dot {
          width:6px; height:6px; border-radius:50%;
          background:#f43f5e; box-shadow:0 0 6px rgba(244,63,94,0.7);
          animation:ap-pulse-ring 2s ease-out infinite;
        }
        .ap-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .ap-title {
          font-family:'Fraunces',serif;
          font-size:30px; font-weight:800; color:#0f172a;
          line-height:1.1; letter-spacing:-0.7px; margin-bottom:5px;
        }
        .ap-title span {
          background:linear-gradient(135deg,#e11d48,#ec4899);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ap-subline { font-size:12.5px; font-weight:400; color:rgba(15,23,42,0.48); }

        .ap-header-icon {
          width:52px; height:52px; border-radius:18px; flex-shrink:0;
          background:linear-gradient(135deg,rgba(244,63,94,0.18),rgba(236,72,153,0.12));
          border:1px solid rgba(244,63,94,0.22);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 6px 20px rgba(244,63,94,0.16);
          opacity:0; animation:ap-fade-up 0.48s 0.08s ease forwards;
        }

        /* ─────────── DIVIDER ─────────── */
        .ap-divider { display:flex; align-items:center; gap:10px; }
        .ap-divider-line { flex:1; height:1px; background:rgba(15,23,42,0.08); }
        .ap-divider-lbl {
          font-size:9.5px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase;
          color:rgba(15,23,42,0.28);
        }

        /* ─────────── BOOKING FORM CARD ─────────── */
        .ap-card {
          background:#fff;
          border:1px solid rgba(15,23,42,0.07);
          border-radius:24px; padding:22px;
          box-shadow:0 2px 14px rgba(15,23,42,0.06);
          position:relative; overflow:hidden;
          transition:border-color 0.25s,box-shadow 0.25s;
        }
        /* top shimmer rule */
        .ap-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(244,63,94,0.4),transparent);
        }
        .ap-card:hover {
          border-color:rgba(244,63,94,0.14);
          box-shadow:0 6px 26px rgba(244,63,94,0.08);
        }

        /* card section head */
        .ap-card-head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .ap-card-icon-wrap {
          width:46px; height:46px; border-radius:15px; flex-shrink:0;
          background:linear-gradient(135deg,rgba(244,63,94,0.15),rgba(236,72,153,0.09));
          border:1px solid rgba(244,63,94,0.20);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 14px rgba(244,63,94,0.14);
          position:relative;
        }
        /* pulse ping on icon */
        .ap-card-icon-wrap::after {
          content:''; position:absolute; inset:-4px; border-radius:19px;
          border:1.5px solid rgba(244,63,94,0.18);
          animation:ap-ping 2.2s ease-out infinite;
        }
        .ap-card-title { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:-0.2px; }
        .ap-card-sub   { font-size:11px; font-weight:400; color:rgba(15,23,42,0.42); margin-top:2px; }

        /* inputs */
        .ap-field-label {
          font-size:9.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
          color:rgba(15,23,42,0.38); display:block; margin-bottom:7px;
        }
        .ap-input {
          width:100%; padding:12px 14px; border-radius:14px;
          background:rgba(244,63,94,0.04);
          border:1.5px solid rgba(244,63,94,0.12);
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px; font-weight:500; color:#0f172a;
          outline:none; box-sizing:border-box;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance:none;
        }
        .ap-input::placeholder { color:rgba(15,23,42,0.32); }
        .ap-input:focus {
          border-color:rgba(244,63,94,0.40);
          background:#fff;
          box-shadow:0 0 0 3px rgba(244,63,94,0.10);
        }
        .ap-field { display:flex; flex-direction:column; margin-bottom:14px; }
        .ap-field:last-child { margin-bottom:0; }
        .ap-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        /* book button */
        .ap-btn-primary {
          display:flex; align-items:center; justify-content:center; gap:9px;
          width:100%; padding:14px; border-radius:16px; border:none; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:13.5px; font-weight:700;
          background:linear-gradient(135deg,#e11d48,#f43f5e,#ec4899);
          color:#fff;
          box-shadow:0 6px 24px rgba(225,29,72,0.32), inset 0 1px 0 rgba(255,255,255,0.2);
          transition:transform 0.18s, box-shadow 0.18s;
          position:relative; overflow:hidden; margin-top:6px;
        }
        .ap-btn-primary::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          background-size:200% 100%; opacity:0; transition:opacity 0.3s;
        }
        .ap-btn-primary:hover {
          transform:translateY(-2px);
          box-shadow:0 10px 32px rgba(225,29,72,0.38), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .ap-btn-primary:hover::after { opacity:1; animation:ap-shimmer 0.85s ease; }
        .ap-btn-primary:active { transform:scale(0.97); }

        .ap-btn-outline {
          display:flex; align-items:center; justify-content:center; gap:9px;
          width:100%; padding:13px; border-radius:16px; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:700;
          background:rgba(255,255,255,0.88);
          color:#374151;
          border:1.5px solid rgba(15,23,42,0.12);
          box-shadow:0 2px 8px rgba(15,23,42,0.06);
          transition:background 0.2s,transform 0.15s,border-color 0.2s,box-shadow 0.2s;
        }
        .ap-btn-outline:hover {
          background:#fff; border-color:rgba(244,63,94,0.28);
          box-shadow:0 4px 16px rgba(244,63,94,0.10);
          transform:translateY(-1px);
        }
        .ap-btn-outline:active { transform:scale(0.97); }

        /* ─────────── CONFIRMED STATE ─────────── */
        .ap-confirmed-card {
          background:#fff;
          border:1px solid rgba(15,23,42,0.07);
          border-radius:24px; padding:28px 22px; text-align:center;
          position:relative; overflow:hidden;
          box-shadow:0 4px 24px rgba(244,63,94,0.08);
          animation:ap-pop-in 0.5s cubic-bezier(0.22,0.68,0,1.1) forwards;
        }
        .ap-confirmed-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#e11d48,#f43f5e,#ec4899,#e11d48);
          background-size:200% 100%;
          animation:ap-shimmer 2.5s ease infinite;
        }

        /* floating icon cluster (like MediLocker) */
        .ap-confirm-cluster {
          display:flex; align-items:flex-end; justify-content:center; gap:10px;
          margin-bottom:20px;
          animation:ap-float 4s ease-in-out infinite;
        }
        .ap-cluster-side {
          width:38px; height:38px; border-radius:13px;
          background:rgba(244,63,94,0.07); border:1px solid rgba(244,63,94,0.14);
          display:flex; align-items:center; justify-content:center;
        }
        .ap-cluster-side-1 { transform:rotate(-5deg) translateY(6px); }
        .ap-cluster-side-2 { transform:rotate(5deg) translateY(6px); }
        .ap-cluster-main-wrap { position:relative; width:70px; height:70px; }
        .ap-cluster-ring {
          position:absolute; inset:-6px; border-radius:28px;
          border:1.5px solid rgba(244,63,94,0.22);
          animation:ap-ping 2s ease-out infinite;
        }
        .ap-cluster-main {
          width:70px; height:70px; border-radius:23px;
          background:linear-gradient(135deg,#e11d48,#f43f5e,#ec4899);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 10px 28px rgba(225,29,72,0.32), inset 0 1px 0 rgba(255,255,255,0.18);
          position:relative; z-index:1;
        }

        .ap-confirmed-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 12px; border-radius:100px;
          background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.18);
          font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
          color:#e11d48; margin-bottom:12px;
        }
        .ap-confirmed-title { font-family:'Fraunces',serif; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:-0.3px; }
        .ap-confirmed-doctor {
          font-size:13px; color:rgba(15,23,42,0.5); margin-top:6px;
          display:flex; align-items:center; justify-content:center; gap:5px;
        }
        .ap-confirmed-doctor b { color:#0f172a; font-weight:700; }
        .ap-confirmed-datetime {
          display:inline-flex; align-items:center; gap:7px;
          margin-top:14px; padding:9px 16px; border-radius:100px;
          background:linear-gradient(135deg,rgba(225,29,72,0.09),rgba(236,72,153,0.06));
          border:1px solid rgba(244,63,94,0.18);
          font-family:'Fraunces',serif; font-size:13px; font-weight:700; color:#e11d48;
        }

        /* stat row on confirmed */
        .ap-stats-row {
          display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-top:18px;
          animation:ap-fade-up 0.5s 0.2s ease both;
        }
        .ap-stat-pill {
          border-radius:14px; padding:10px 8px; text-align:center;
          background:rgba(244,63,94,0.06); border:1px solid rgba(244,63,94,0.12);
        }
        .ap-stat-val { font-family:'Fraunces',serif; font-size:17px; font-weight:800; color:#e11d48; line-height:1; }
        .ap-stat-lbl { font-size:9.5px; font-weight:600; color:rgba(15,23,42,0.4); margin-top:3px; letter-spacing:0.04em; text-transform:uppercase; }

        /* ─────────── QR CARD ─────────── */
        .ap-qr-card {
          background:#fff;
          border:1px solid rgba(15,23,42,0.07);
          border-radius:24px; padding:22px;
          text-align:center; position:relative; overflow:hidden;
          box-shadow:0 2px 14px rgba(15,23,42,0.06);
          animation:ap-slide-in 0.5s 0.12s cubic-bezier(0.22,0.68,0,1.1) both;
        }
        .ap-qr-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(244,63,94,0.35),transparent);
        }

        .ap-qr-head { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px; }
        .ap-qr-title { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:#0f172a; }
        .ap-qr-sub   { font-size:11.5px; color:rgba(15,23,42,0.44); line-height:1.55; margin-bottom:20px; }

        /* QR frame */
        .ap-qr-frame {
          display:inline-block; padding:16px; border-radius:22px;
          background:#fff;
          border:2px solid rgba(244,63,94,0.15);
          box-shadow:0 8px 32px rgba(244,63,94,0.10), inset 0 1px 0 rgba(255,255,255,0.8);
          position:relative;
        }
        /* corner accents */
        .ap-qr-frame::before, .ap-qr-frame::after {
          content:''; position:absolute;
          width:18px; height:18px;
          border-color:#f43f5e; border-style:solid;
        }
        .ap-qr-frame::before { top:6px; left:6px; border-width:2.5px 0 0 2.5px; border-radius:4px 0 0 0; }
        .ap-qr-frame::after  { bottom:6px; right:6px; border-width:0 2.5px 2.5px 0; border-radius:0 0 4px 0; }

        .ap-qr-hint {
          margin-top:14px; font-size:10.5px; font-weight:600; color:rgba(244,63,94,0.6);
          display:flex; align-items:center; justify-content:center; gap:5px;
          letter-spacing:0.04em; text-transform:uppercase;
        }

        /* ─────────── HEALTH SUMMARY INFO ─────────── */
        .ap-summary-note {
          border-radius:18px; padding:14px 16px;
          background:linear-gradient(135deg,rgba(244,63,94,0.07),rgba(236,72,153,0.04));
          border:1px solid rgba(244,63,94,0.16);
          display:flex; align-items:flex-start; gap:10px;
          animation:ap-fade-up 0.5s 0.18s ease both;
        }
        .ap-summary-note-ico {
          width:34px; height:34px; border-radius:11px; flex-shrink:0;
          background:rgba(244,63,94,0.12); border:1px solid rgba(244,63,94,0.2);
          display:flex; align-items:center; justify-content:center;
        }
        .ap-summary-note-title { font-family:'Fraunces',serif; font-size:12.5px; font-weight:700; color:#e11d48; margin-bottom:4px; }
        .ap-summary-note-text  { font-size:11px; color:rgba(15,23,42,0.5); line-height:1.65; }
      `}</style>

      
      <div className="ap-bg" aria-hidden>
        <div className="ap-grid" />
        <div className="ap-orb ap-orb-1" />
        <div className="ap-orb ap-orb-2" />
        <div className="ap-orb ap-orb-3" />
      </div>

      <div className="ap">
        <div className="ap-content">

          
          <div className="ap-reveal" style={{ animationDelay: "0ms" }}>
            <div className="ap-chip">
              <span className="ap-chip-dot" />
              <Sparkles size={9} /> Doctor Consultation
            </div>
            <div className="ap-header-row">
              <div>
                <div className="ap-title">Book an<br /><span>Appointment</span></div>
                <div className="ap-subline">Schedule a visit &amp; share your health summary</div>
              </div>
              <div className="ap-header-icon">
                <Stethoscope size={22} color="#e11d48" />
              </div>
            </div>
          </div>

          
          {!booked ? (
            <>
              <div className="ap-divider ap-reveal" style={{ animationDelay: "70ms" }}>
                <div className="ap-divider-line" />
                <span className="ap-divider-lbl">Doctor Details</span>
                <div className="ap-divider-line" />
              </div>

              <div className="ap-card ap-reveal" style={{ animationDelay: "100ms" }}>
                <div className="ap-card-head">
                  <div className="ap-card-icon-wrap">
                    <Stethoscope size={20} color="#e11d48" />
                  </div>
                  <div>
                    <div className="ap-card-title">Doctor Information</div>
                    <div className="ap-card-sub">Fill in your appointment details below</div>
                  </div>
                </div>

                <div className="ap-field">
                  <label className="ap-field-label">Doctor's Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Sharma"
                    className="ap-input"
                  />
                </div>

                <div className="ap-grid-2">
                  <div className="ap-field">
                    <label className="ap-field-label">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="ap-input"
                    />
                  </div>
                  <div className="ap-field">
                    <label className="ap-field-label">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="ap-input"
                    />
                  </div>
                </div>

                <button className="ap-btn-primary" onClick={handleBook}>
                  <Calendar size={17} />
                  Book Appointment
                </button>
              </div>

              
              <div className="ap-summary-note ap-reveal" style={{ animationDelay: "160ms" }}>
                <div className="ap-summary-note-ico">
                  <Share2 size={15} color="#e11d48" />
                </div>
                <div>
                  <div className="ap-summary-note-title">Health Summary QR</div>
                  <div className="ap-summary-note-text">
                    After booking, a QR code will be generated with your medicine &amp; adherence data — share it directly with your doctor.
                  </div>
                </div>
              </div>
            </>
          ) : (

      // confirmed state
            <>
              <div className="ap-divider ap-reveal" style={{ animationDelay: "0ms" }}>
                <div className="ap-divider-line" />
                <span className="ap-divider-lbl">Confirmation</span>
                <div className="ap-divider-line" />
              </div>

              
              <div className="ap-confirmed-card ap-reveal" style={{ animationDelay: "40ms" }}>
               
                
                <div className="ap-confirm-cluster">
                  <div className="ap-cluster-side ap-cluster-side-1">
                    <Activity size={15} color="rgba(244,63,94,0.5)" />
                  </div>
                  <div className="ap-cluster-main-wrap">
                    <div className="ap-cluster-ring" />
                    <div className="ap-cluster-main">
                      <CheckCircle size={30} color="#fff" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="ap-cluster-side ap-cluster-side-2">
                    <Heart size={15} color="rgba(244,63,94,0.5)" />
                  </div>
                </div>

                <div className="ap-confirmed-badge">
                  <CheckCircle size={11} />
                  Appointment Confirmed
                </div>

                <div className="ap-confirmed-title">You're all set!</div>
                <div className="ap-confirmed-doctor">
                  Visit with <b>&nbsp;{doctorName}</b>
                </div>

                <div className="ap-confirmed-datetime">
                  <Calendar size={14} />
                  {new Date(date).toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                  &nbsp;·&nbsp;
                  <Clock size={14} />
                  {time}
                </div>

                
                {(() => {
                  const meds = getSavedMedicines();
                  const stats = getTodayAdherenceStats();
                  return (
                    <div className="ap-stats-row">
                      <div className="ap-stat-pill">
                        <div className="ap-stat-val">{meds.length}</div>
                        <div className="ap-stat-lbl">Medicines</div>
                      </div>
                      <div className="ap-stat-pill">
                        <div className="ap-stat-val">{stats.percentage}%</div>
                        <div className="ap-stat-lbl">Adherence</div>
                      </div>
                      <div className="ap-stat-pill">
                        <div className="ap-stat-val">{stats.taken}/{stats.total}</div>
                        <div className="ap-stat-lbl">Doses</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="ap-qr-card ap-reveal" style={{ animationDelay: "80ms" }}>
                <div className="ap-qr-head">
                  <Share2 size={16} color="#e11d48" />
                  <div className="ap-qr-title">Health Summary QR</div>
                </div>
                <div className="ap-qr-sub">
                  Show this to your doctor to instantly share your<br />medicine &amp; adherence data
                </div>

                <div className="ap-qr-frame">
                  <QRCodeSVG value={healthSummary} size={200} level="M" />
                </div>

                <div className="ap-qr-hint">
                  <Share2 size={10} />
                  Scan to view health summary
                </div>

                <button className="ap-btn-outline" style={{ marginTop: 18 }} onClick={handleCopy}>
                  <Copy size={15} />
                  Copy Health Summary
                </button>
              </div>

              
              <button
                className="ap-btn-outline ap-reveal"
                style={{ animationDelay: "130ms" }}
                onClick={() => {
                  setBooked(false);
                  setDoctorName("");
                  setDate("");
                  setTime("");
                }}
              >
                <Calendar size={15} />
                Book Another Appointment
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
