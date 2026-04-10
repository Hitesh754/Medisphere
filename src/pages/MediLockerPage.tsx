// have to add that medilocker feature here in future (Kevin-47)
import { useState, useRef } from "react";
import { FolderLock, FileText, Upload, Calendar, Loader as Loader2, User, MapPin, Stethoscope, Activity, Heart, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, CircleArrowUp as ArrowUpCircle, CircleArrowDown as ArrowDownCircle, CircleMinus as MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LabResult {
  testName: string;
  result: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "abnormal";
}

interface LabReportData {
  patientName: string;
  patientDOB: string;
  patientAddress: string;
  patientGender: string;
  orderingPhysician: string;
  labResults: LabResult[];
  collectionDate?: string;
  reportDate?: string;
  labName?: string;
  notes?: string;
  healthSummary?: string;
  error?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const statusConfig = {
  normal: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Normal", hex: "#10b981", badgeBg: "rgba(16,185,129,0.1)", badgeBorder: "rgba(16,185,129,0.22)" },
  high: { icon: ArrowUpCircle, color: "text-destructive", bg: "bg-destructive/10", label: "High", hex: "#ef4444", badgeBg: "rgba(239,68,68,0.1)", badgeBorder: "rgba(239,68,68,0.22)" },
  low: { icon: ArrowDownCircle, color: "text-warning", bg: "bg-warning/10", label: "Low", hex: "#f59e0b", badgeBg: "rgba(245,158,11,0.1)", badgeBorder: "rgba(245,158,11,0.22)" },
  abnormal: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Abnormal", hex: "#ef4444", badgeBg: "rgba(239,68,68,0.1)", badgeBorder: "rgba(239,68,68,0.22)" },
};

export default function MediLockerPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<LabReportData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPEG, PNG, WebP).");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setReportData(null);

    try {
      const fileBase64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("extract-lab-report", {
        body: { fileBase64, mimeType: file.type, fileName: file.name },
      });

      if (error) {
        throw new Error(error.message || "Failed to analyze lab report");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setReportData(data as LabReportData);
      try {
        const existing = JSON.parse(localStorage.getItem("clearscript_lab_reports_detail") || "[]");
        const detail = {
          summary: data.healthSummary || `Lab report with ${data.labResults?.length || 0} tests`,
          doctor: data.orderingPhysician && data.orderingPhysician !== "not present" ? data.orderingPhysician : undefined,
          tests: data.labResults?.map((t: any) => t.testName) || [],
          date: data.reportDate || data.collectionDate || new Date().toLocaleDateString(),
        };
        existing.unshift(detail);
        localStorage.setItem("clearscript_lab_reports_detail", JSON.stringify(existing.slice(0, 10)));
        // Also keep old format for backwards compat
        const oldExisting = JSON.parse(localStorage.getItem("clearscript_lab_reports") || "[]");
        const summary = data.healthSummary
          ? `${data.patientName ? data.patientName + ": " : ""}${data.healthSummary}`
          : `Lab report analyzed with ${data.labResults?.length || 0} tests`;
        oldExisting.unshift(summary);
        localStorage.setItem("clearscript_lab_reports", JSON.stringify(oldExisting.slice(0, 10)));
      } catch {}
      toast.success("Lab report analyzed successfully!");
    } catch (e: any) {
      console.error("Lab report error:", e);
      toast.error(e.message || "Failed to analyze lab report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isPresent = (val?: string) => val && val !== "not present";

  const counts = (reportData?.labResults || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        /* ── Keyframes ── */
        @keyframes ml-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-7px) rotate(1deg); }
          66%       { transform: translateY(-3px) rotate(-0.8deg); }
        }
        @keyframes ml-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
          70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes ml-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ml-pop-in {
          0%   { opacity: 0; transform: scale(0.88); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ml-badge-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ml-check-pop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes ml-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ml-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(12px, -18px) scale(1.07); }
          66%       { transform: translate(-9px, 9px) scale(0.95); }
        }
        @keyframes ml-ping {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes ml-progress {
          0%   { width: 0%; }
          20%  { width: 30%; }
          50%  { width: 58%; }
          80%  { width: 80%; }
          100% { width: 91%; }
        }
        @keyframes ml-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes ml-bar-grow {
          from { width: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Root ── */
        .ml-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F0F5F2;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: #111827;
        }

        /* ── Ambient BG ── */
        .ml-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .ml-orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: ml-orb-drift 13s ease-in-out infinite;
        }
        .ml-orb-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%);
          top: -130px; right: -100px; animation-delay: 0s;
        }
        .ml-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%);
          top: 45%; left: -100px; animation-delay: -4.5s;
        }
        .ml-orb-3 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%);
          bottom: 130px; right: -60px; animation-delay: -8s;
        }
        .ml-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Layout ── */
        .ml-content {
          position: relative; z-index: 1;
          padding: 52px 20px 100px;
          display: flex; flex-direction: column; gap: 22px;
          max-width: 540px; margin: 0 auto;
        }

        /* ── Header ── */
        .ml-header { animation: ml-fade-up 0.5s ease forwards; }
        .ml-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px 4px 8px; border-radius: 100px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.24);
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #059669; margin-bottom: 12px;
          animation: ml-badge-in 0.6s 0.15s ease forwards; opacity: 0;
        }
        .ml-chip-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px rgba(16,185,129,0.7);
          animation: ml-pulse-ring 2s ease-out infinite;
        }
        .ml-title {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 800; color: #0f172a;
          line-height: 1.08; letter-spacing: -0.8px;
          margin: 0 0 6px;
        }
        .ml-title span {
          background: linear-gradient(135deg, #059669, #34d399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ml-sub {
          font-size: 13px; color: rgba(15,23,42,0.5); font-weight: 400; line-height: 1.5;
        }

        /* ── Header icon badge ── */
        .ml-header-row { display: flex; align-items: flex-start; justify-content: space-between; }
        .ml-icon-badge {
          width: 54px; height: 54px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(52,211,153,0.12));
          border: 1px solid rgba(16,185,129,0.22);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(16,185,129,0.15);
          animation: ml-fade-up 0.5s 0.05s ease forwards; opacity: 0;
        }

        /* ── Upload Zone ── */
        .ml-upload-zone {
          border-radius: 24px;
          border: 1.5px dashed rgba(16,185,129,0.3);
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(16,185,129,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 40px 24px 36px;
          display: flex; flex-direction: column; align-items: center; gap: 22px;
          text-align: center;
          position: relative; overflow: hidden;
          animation: ml-fade-up 0.5s 0.1s ease forwards; opacity: 0;
          cursor: pointer;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .ml-upload-zone:hover, .ml-upload-zone.dragover {
          border-color: rgba(16,185,129,0.55);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 8px 32px rgba(16,185,129,0.12), inset 0 1px 0 #fff;
        }
        .ml-upload-zone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.05), transparent);
          pointer-events: none;
        }

        /* Floating icon cluster */
        .ml-icon-cluster {
          display: flex; align-items: flex-end; justify-content: center; gap: 10px;
          animation: ml-float 5s ease-in-out infinite;
        }
        .ml-cluster-side {
          width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
          background: rgba(240,245,242,0.9);
          border: 1px solid rgba(16,185,129,0.14);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 12px rgba(16,185,129,0.08);
        }
        .ml-cluster-main-wrap {
          position: relative;
          width: 76px; height: 76px;
        }
        .ml-cluster-main-glow {
          position: absolute; inset: -8px; border-radius: 28px;
          background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
          animation: ml-pulse-ring 2.5s ease-out infinite;
          z-index: 0;
        }
        .ml-cluster-main {
          width: 76px; height: 76px; border-radius: 24px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.22), rgba(52,211,153,0.15));
          border: 1px solid rgba(16,185,129,0.28);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 28px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.4);
          position: relative; z-index: 1;
        }
        .ml-cluster-side-1 { transform: rotate(-5deg) translateY(6px); }
        .ml-cluster-side-2 { transform: rotate(5deg) translateY(6px); }

        .ml-upload-title {
          font-family: 'Fraunces', serif;
          font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 4px;
        }
        .ml-upload-sub { font-size: 12px; color: rgba(15,23,42,0.45); font-weight: 400; }

        /* Format pills */
        .ml-format-row { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
        .ml-format-pill {
          font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          color: rgba(15,23,42,0.4);
          background: rgba(15,23,42,0.05);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 8px; padding: 3px 8px;
        }

        /* Buttons */
        .ml-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #059669, #34d399);
          color: #fff;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden; width: 100%; justify-content: center;
        }
        .ml-btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%; opacity: 0; transition: opacity 0.3s;
        }
        .ml-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .ml-btn-primary:hover::after { opacity: 1; animation: ml-shimmer 0.8s ease; }
        .ml-btn-primary:active { transform: scale(0.97); }

        .ml-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: 14px; cursor: pointer; width: 100%; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          background: rgba(255,255,255,0.85);
          color: #374151;
          border: 1px solid rgba(15,23,42,0.12);
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
          transition: background 0.2s, transform 0.15s, border-color 0.2s, box-shadow 0.2s;
        }
        .ml-btn-outline:hover {
          background: #fff;
          border-color: rgba(16,185,129,0.3);
          box-shadow: 0 4px 14px rgba(16,185,129,0.1);
          transform: translateY(-1px);
        }
        .ml-btn-outline:active { transform: scale(0.97); }

        /* ── Loading Card ── */
        .ml-loading-card {
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 8px 32px rgba(15,23,42,0.08);
          padding: 44px 24px 36px;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
          text-align: center;
          animation: ml-pop-in 0.45s ease forwards;
          position: relative; overflow: hidden;
        }
        .ml-loading-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #059669, #34d399, #06b6d4);
          animation: ml-progress 8s ease forwards;
        }
        .ml-loading-ring-wrap {
          position: relative; width: 88px; height: 88px;
        }
        .ml-ring-outer {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(16,185,129,0.2);
          animation: ml-ping 1.5s ease-out infinite;
        }
        .ml-ring-inner {
          position: absolute; inset: 10px; border-radius: 50%;
          border: 2px solid rgba(16,185,129,0.14);
          animation: ml-ping 1.5s ease-out infinite 0.25s;
        }
        .ml-ring-core {
          position: absolute; inset: 0; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #34d399);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
        }
        .ml-loading-title {
          font-family: 'Fraunces', serif;
          font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 3px;
        }
        .ml-loading-file { font-size: 12px; color: #059669; font-weight: 600; }
        .ml-steps { display: flex; flex-direction: column; gap: 10px; text-align: left; width: 100%; max-width: 260px; }
        .ml-step-row { display: flex; align-items: center; gap: 10px; }
        .ml-step-dot {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.22);
          display: flex; align-items: center; justify-content: center;
        }
        .ml-step-text { font-size: 12px; color: rgba(15,23,42,0.5); }
        .ml-dots span {
          display: inline-block; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(16,185,129,0.6);
          animation: ml-dot-bounce 1.2s ease-in-out infinite; margin: 0 1px;
        }
        .ml-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ml-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── Summary Banner ── */
        .ml-summary-banner {
          border-radius: 22px; padding: 20px;
          background: linear-gradient(135deg, rgba(16,185,129,0.09), rgba(52,211,153,0.05));
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow: 0 4px 20px rgba(16,185,129,0.07);
          display: flex; flex-direction: column; gap: 14px;
          position: relative; overflow: hidden;
          animation: ml-fade-up 0.4s ease forwards; opacity: 0;
        }
        .ml-summary-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 70% at 0% 0%, rgba(16,185,129,0.07), transparent);
          pointer-events: none;
        }
        .ml-summary-top { display: flex; align-items: center; justify-content: space-between; }
        .ml-summary-label {
          font-family: 'Fraunces', serif;
          font-size: 14px; font-weight: 700; color: #059669;
          display: flex; align-items: center; gap: 8px;
        }
        .ml-summary-date { font-size: 11px; color: rgba(15,23,42,0.35); font-weight: 500; }
        .ml-stat-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .ml-stat-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px;
        }
        .ml-stat-num {
          font-family: 'Fraunces', serif;
          font-size: 16px; font-weight: 800; line-height: 1;
        }
        .ml-stat-lbl { font-size: 11px; font-weight: 600; }
        .ml-lab-name {
          font-size: 11px; color: rgba(15,23,42,0.35); font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── Section Card ── */
        .ml-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 22px; padding: 18px;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          position: relative; overflow: hidden;
          opacity: 0;
          animation: ml-fade-up 0.45s ease forwards;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }
        .ml-card:hover {
          border-color: rgba(16,185,129,0.2);
          box-shadow: 0 6px 24px rgba(16,185,129,0.09);
          transform: translateY(-1px);
        }
        .ml-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent);
        }

        .ml-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ml-section-icon {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(52,211,153,0.09));
          border: 1px solid rgba(16,185,129,0.18);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(16,185,129,0.1);
        }
        .ml-section-title {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 700; color: #0f172a;
        }
        .ml-section-count {
          margin-left: auto;
          font-family: 'Fraunces', serif; font-size: 11px; font-weight: 800;
          color: #059669;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          padding: 2px 10px; border-radius: 100px;
        }

        /* Info rows */
        .ml-info-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 0; border-bottom: 1px solid rgba(15,23,42,0.06);
          transition: background 0.15s;
        }
        .ml-info-row:last-child { border-bottom: none; }
        .ml-info-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(15,23,42,0.35);
        }
        .ml-info-value {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #111827;
        }

        /* Address row */
        .ml-address-row { display: flex; align-items: flex-start; gap: 8px; padding: 9px 0; }
        .ml-address-text { font-size: 12px; color: rgba(15,23,42,0.5); line-height: 1.65; }

        .ml-empty-text { font-size: 13px; color: rgba(15,23,42,0.4); font-style: italic; padding: 4px 0; }

        /* Two column */
        .ml-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── Result Row ── */
        .ml-results-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 22px;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          overflow: hidden;
          opacity: 0;
          animation: ml-fade-up 0.45s ease forwards;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .ml-results-card:hover {
          border-color: rgba(16,185,129,0.18);
          box-shadow: 0 6px 24px rgba(16,185,129,0.08);
        }
        .ml-results-card::before {
          content: '';
          display: block; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent);
        }
        .ml-results-header { padding: 16px 18px 8px; }

        .ml-result-row {
          padding: 16px 18px;
          border-top: 1px solid rgba(15,23,42,0.05);
          transition: background 0.2s;
        }
        .ml-result-row:hover { background: rgba(16,185,129,0.025); }

        .ml-result-inner { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .ml-result-test {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(15,23,42,0.35); margin-bottom: 4px;
        }
        .ml-result-value {
          font-family: 'Fraunces', serif;
          font-size: 26px; font-weight: 800; color: #111827; line-height: 1.05;
        }
        .ml-result-ref { display: flex; align-items: center; gap: 5px; margin-top: 5px; }
        .ml-ref-label {
          font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(15,23,42,0.3);
        }
        .ml-ref-val { font-size: 11px; color: rgba(15,23,42,0.45); font-weight: 500; }

        /* Progress bar */
        .ml-bar-wrap {
          height: 3px; background: rgba(15,23,42,0.07); border-radius: 4px; overflow: hidden; margin-top: 10px;
        }
        .ml-bar {
          height: 100%; border-radius: 4px;
          animation: ml-bar-grow 0.8s ease forwards;
        }

        /* Status badge */
        .ml-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 100px; flex-shrink: 0;
          font-size: 11px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Health Summary ── */
        .ml-health-summary {
          border-radius: 22px; padding: 20px;
          background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.07));
          border: 1px solid rgba(16,185,129,0.2);
          box-shadow: 0 6px 24px rgba(16,185,129,0.1);
          display: flex; gap: 14px; align-items: flex-start;
          position: relative; overflow: hidden;
          opacity: 0;
          animation: ml-fade-up 0.45s ease forwards;
        }
        .ml-health-summary::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16,185,129,0.08), transparent);
          pointer-events: none;
        }
        .ml-health-icon {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(16,185,129,0.2);
        }
        .ml-health-title {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #059669; margin-bottom: 6px;
        }
        .ml-health-text { font-size: 12px; color: rgba(15,23,42,0.6); line-height: 1.7; }

        /* ── Notes ── */
        .ml-notes-card {
          border-radius: 22px; padding: 18px;
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.15);
          border-left: 3px solid rgba(16,185,129,0.5);
          opacity: 0;
          animation: ml-fade-up 0.45s ease forwards;
        }
        .ml-notes-title {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #059669;
          display: flex; align-items: center; gap: 7px; margin-bottom: 8px;
        }
        .ml-notes-text { font-size: 12px; color: rgba(15,23,42,0.55); line-height: 1.7; }

        /* ── Disclaimer ── */
        .ml-disclaimer {
          border-radius: 16px; padding: 13px 15px;
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.2);
          display: flex; align-items: flex-start; gap: 10px;
          opacity: 0;
          animation: ml-fade-up 0.45s ease forwards;
        }
        .ml-disclaimer-text { font-size: 11px; color: rgba(15,23,42,0.5); line-height: 1.65; }

        /* ── Divider ── */
        .ml-divider {
          display: flex; align-items: center; gap: 10px;
        }
        .ml-divider-line { flex: 1; height: 1px; background: rgba(15,23,42,0.08); }
        .ml-divider-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(15,23,42,0.3);
        }

        .hidden-input { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ml-root">
        
        <div className="ml-bg">
          <div className="ml-grid" />
          <div className="ml-orb ml-orb-1" />
          <div className="ml-orb ml-orb-2" />
          <div className="ml-orb ml-orb-3" />
        </div>

        <div className="ml-content">

          
          <div className="ml-header">
            <div className="ml-header-row">
              <div>
                <div className="ml-chip">
                  <span className="ml-chip-dot" />
                  AI Analysis
                </div>
                <h1 className="ml-title">
                  Medi<span>Locker</span>
                </h1>
                <p className="ml-sub">Upload a lab report to extract patient info &amp; test results</p>
              </div>
              <div className="ml-icon-badge">
                <FolderLock size={24} color="#059669" />
              </div>
            </div>
          </div>

          
          {!reportData && !loading && (
            <div
              className={`ml-upload-zone${dragOver ? " dragover" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="ml-icon-cluster">
                <div className="ml-cluster-side ml-cluster-side-1">
                  <FileText size={18} color="rgba(15,23,42,0.3)" />
                </div>
                <div className="ml-cluster-main-wrap">
                  <div className="ml-cluster-main-glow" />
                  <div className="ml-cluster-main">
                    <FolderLock size={32} color="#059669" />
                  </div>
                </div>
                <div className="ml-cluster-side ml-cluster-side-2">
                  <Activity size={18} color="rgba(15,23,42,0.3)" />
                </div>
              </div>

              <div>
                <div className="ml-upload-title">Drop your lab report here</div>
                <div className="ml-upload-sub">PDF or image — AI extracts all results instantly</div>
              </div>

              <button
                className="ml-btn-primary"
                style={{ maxWidth: 240 }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Upload size={16} />
                Choose File to Analyze
              </button>

              <div className="ml-format-row">
                {["PDF", "JPEG", "PNG", "WebP"].map(f => (
                  <span key={f} className="ml-format-pill">{f}</span>
                ))}
                <span style={{ fontSize: 10, color: "rgba(15,23,42,0.3)" }}>· Max 10MB</span>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden-input"
            onChange={onFileChange}
          />

          
          {loading && (
            <div className="ml-loading-card">
              <div className="ml-loading-ring-wrap">
                <div className="ml-ring-outer" />
                <div className="ml-ring-inner" />
                <div className="ml-ring-core">
                  <Loader2
                    size={28}
                    color="#fff"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                </div>
              </div>

              <div>
                <div className="ml-loading-title">Analyzing Report</div>
                <div className="ml-loading-file" style={{ marginTop: 3 }}>{fileName}</div>
              </div>

              <div className="ml-steps">
                {[
                  "Parsing document structure",
                  "Extracting patient details",
                  "Reading test results",
                  "Classifying biomarkers",
                ].map((step, i) => (
                  <div key={step} className="ml-step-row">
                    <div className="ml-step-dot">
                      <span className="ml-dots">
                        <span style={{ animationDelay: `${i * 0.15}s` }} />
                      </span>
                    </div>
                    <span className="ml-step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {reportData && !reportData.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              
              <div className="ml-summary-banner">
                <div className="ml-summary-top">
                  <div className="ml-summary-label">
                    <Heart size={15} color="#059669" />
                    Report Summary
                  </div>
                  {isPresent(reportData.reportDate) && (
                    <span className="ml-summary-date">{reportData.reportDate}</span>
                  )}
                </div>

                {reportData.labResults?.length > 0 && (
                  <div className="ml-stat-row">
                    {[
                      { key: "normal",   label: "Normal",   bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.22)",  fg: "#059669" },
                      { key: "high",     label: "High",     bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.2)",    fg: "#ef4444" },
                      { key: "low",      label: "Low",      bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.2)",   fg: "#d97706" },
                      { key: "abnormal", label: "Abnormal", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.2)",    fg: "#ef4444" },
                    ]
                      .filter(s => (counts[s.key] || 0) > 0)
                      .map(s => (
                        <div
                          key={s.key}
                          className="ml-stat-pill"
                          style={{ background: s.bg, border: `1px solid ${s.border}` }}
                        >
                          <span className="ml-stat-num" style={{ color: s.fg }}>{counts[s.key]}</span>
                          <span className="ml-stat-lbl" style={{ color: s.fg, opacity: 0.8 }}>{s.label}</span>
                        </div>
                      ))}
                  </div>
                )}

                {isPresent(reportData.labName) && (
                  <div className="ml-lab-name">
                    <Activity size={11} color="rgba(15,23,42,0.3)" />
                    {reportData.labName}
                  </div>
                )}
              </div>

              
              <div className="ml-card" style={{ animationDelay: "0.08s" }}>
                <div className="ml-section-head">
                  <div className="ml-section-icon">
                    <User size={16} color="#059669" />
                  </div>
                  <span className="ml-section-title">Patient Information</span>
                </div>
                {isPresent(reportData.patientName) && (
                  <div className="ml-info-row">
                    <span className="ml-info-label">Name</span>
                    <span className="ml-info-value">{reportData.patientName}</span>
                  </div>
                )}
                {isPresent(reportData.patientDOB) && (
                  <div className="ml-info-row">
                    <span className="ml-info-label">Date of Birth</span>
                    <span className="ml-info-value">{reportData.patientDOB}</span>
                  </div>
                )}
                {isPresent(reportData.patientGender) && (
                  <div className="ml-info-row">
                    <span className="ml-info-label">Gender</span>
                    <span className="ml-info-value">
                      {reportData.patientGender === "M" ? "Male" : reportData.patientGender === "F" ? "Female" : reportData.patientGender}
                    </span>
                  </div>
                )}
                {isPresent(reportData.patientAddress) && (
                  <div className="ml-address-row">
                    <MapPin size={13} color="rgba(15,23,42,0.3)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span className="ml-address-text">{reportData.patientAddress}</span>
                  </div>
                )}
                {!isPresent(reportData.patientName) && !isPresent(reportData.patientDOB) && !isPresent(reportData.patientGender) && !isPresent(reportData.patientAddress) && (
                  <p className="ml-empty-text">No patient information found in the report</p>
                )}
              </div>

              {/* Physician + Details (two-col if both present) */}
              {(isPresent(reportData.orderingPhysician) || isPresent(reportData.labName) || isPresent(reportData.collectionDate) || isPresent(reportData.reportDate)) && (
                <div className={isPresent(reportData.orderingPhysician) && (isPresent(reportData.labName) || isPresent(reportData.collectionDate)) ? "ml-two-col" : ""}>
                  {isPresent(reportData.orderingPhysician) && (
                    <div className="ml-card" style={{ animationDelay: "0.14s" }}>
                      <div className="ml-section-head">
                        <div className="ml-section-icon">
                          <Stethoscope size={16} color="#059669" />
                        </div>
                        <span className="ml-section-title">Physician</span>
                      </div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: "#111827" }}>
                        {reportData.orderingPhysician}
                      </div>
                    </div>
                  )}
                  {(isPresent(reportData.labName) || isPresent(reportData.collectionDate) || isPresent(reportData.reportDate)) && (
                    <div className="ml-card" style={{ animationDelay: "0.16s" }}>
                      <div className="ml-section-head">
                        <div className="ml-section-icon">
                          <Calendar size={16} color="#059669" />
                        </div>
                        <span className="ml-section-title">Details</span>
                      </div>
                      {isPresent(reportData.labName) && (
                        <div className="ml-info-row">
                          <span className="ml-info-label">Lab</span>
                          <span className="ml-info-value">{reportData.labName}</span>
                        </div>
                      )}
                      {isPresent(reportData.collectionDate) && (
                        <div className="ml-info-row">
                          <span className="ml-info-label">Collected</span>
                          <span className="ml-info-value">{reportData.collectionDate}</span>
                        </div>
                      )}
                      {isPresent(reportData.reportDate) && (
                        <div className="ml-info-row">
                          <span className="ml-info-label">Reported</span>
                          <span className="ml-info-value">{reportData.reportDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lab Results */}
              {reportData.labResults && reportData.labResults.length > 0 && (
                <>
                  <div className="ml-divider" style={{ animationDelay: "0.2s" }}>
                    <div className="ml-divider-line" />
                    <span className="ml-divider-label">Test Results</span>
                    <div className="ml-divider-line" />
                  </div>

                  <div className="ml-results-card" style={{ animationDelay: "0.22s" }}>
                    <div className="ml-results-header">
                      <div className="ml-section-head" style={{ marginBottom: 4 }}>
                        <div className="ml-section-icon">
                          <Activity size={16} color="#059669" />
                        </div>
                        <span className="ml-section-title">Lab Results</span>
                        <span className="ml-section-count">{reportData.labResults.length}</span>
                      </div>
                    </div>

                    {reportData.labResults.map((test, i) => {
                      const cfg = statusConfig[test.status] || statusConfig.normal;
                      const StatusIcon = cfg.icon;
                      const barWidths: Record<string, string> = { normal: "55%", high: "85%", low: "18%", abnormal: "75%" };
                      return (
                        <div key={i} className="ml-result-row">
                          <div className="ml-result-inner">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="ml-result-test">{test.testName}</div>
                              <div className="ml-result-value">{test.result}</div>
                              <div className="ml-result-ref">
                                <span className="ml-ref-label">ref</span>
                                <span className="ml-ref-val">{test.referenceRange}</span>
                              </div>
                              <div className="ml-bar-wrap">
                                <div
                                  className="ml-bar"
                                  style={{
                                    width: barWidths[test.status] || "50%",
                                    background: cfg.hex,
                                    animationDelay: `${i * 0.07}s`,
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              className="ml-status-badge"
                              style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, color: cfg.hex }}
                            >
                              <StatusIcon size={13} className={cfg.color} />
                              {cfg.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Health Summary */}
              {reportData.healthSummary && (
                <div className="ml-health-summary" style={{ animationDelay: "0.28s" }}>
                  <div className="ml-health-icon">
                    <Heart size={20} color="#059669" />
                  </div>
                  <div>
                    <div className="ml-health-title">Health Summary</div>
                    <div className="ml-health-text">{reportData.healthSummary}</div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {isPresent(reportData.notes) && (
                <div className="ml-notes-card" style={{ animationDelay: "0.32s" }}>
                  <div className="ml-notes-title">
                    <Activity size={14} color="#059669" />
                    Clinical Notes
                  </div>
                  <div className="ml-notes-text">{reportData.notes}</div>
                </div>
              )}

              
              <div className="ml-disclaimer" style={{ animationDelay: "0.36s" }}>
                <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                <span className="ml-disclaimer-text">
                  This AI analysis is for informational purposes only. Always consult a qualified healthcare professional for medical decisions.
                </span>
              </div>

              
              <button
                className="ml-btn-outline"
                style={{ animationDelay: "0.38s" }}
                onClick={() => { setReportData(null); setFileName(null); }}
              >
                <Upload size={15} />
                Analyze Another Report
              </button>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
