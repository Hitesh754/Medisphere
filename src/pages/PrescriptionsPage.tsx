
import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader as Loader2, Pill, Clock, Info, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveMedicines } from "@/lib/medicineStore";

interface MedicineResult {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  advisory: string;
  description?: string;
}

interface ScanResponse {
  medicines: MedicineResult[];
  generalAdvice: string;
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

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setLoading(true);
    setResults(null);

    try {
      const imageBase64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("scan-prescription", {
        body: { imageBase64, mimeType: file.type },
      });

      if (error) {
        throw new Error(error.message || "Failed to scan prescription");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data as ScanResponse);
      if (data.medicines?.length) {
        saveMedicines(data.medicines);
      }
      toast.success(`Found ${data.medicines?.length || 0} medicine(s) in your prescription!`);
    } catch (e: any) {
      console.error("Scan error:", e);
      toast.error(e.message || "Failed to scan prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        /* ── Keyframes ── */
        @keyframes rx-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-8px) rotate(1.5deg); }
          66%       { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes rx-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
          70%  { box-shadow: 0 0 0 14px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes rx-scan-beam {
          0%   { top: -2px; opacity: 1; }
          100% { top: 102%; opacity: 0.4; }
        }
        @keyframes rx-scan-corner {
          0%   { opacity: 0.4; transform: scale(0.95); }
          50%  { opacity: 1;   transform: scale(1); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
        @keyframes rx-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rx-slide-right {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rx-pop-in {
          0%   { opacity: 0; transform: scale(0.88); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rx-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rx-progress {
          0%   { width: 0%; }
          20%  { width: 35%; }
          50%  { width: 60%; }
          80%  { width: 82%; }
          100% { width: 92%; }
        }
        @keyframes rx-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes rx-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(15px, -20px) scale(1.08); }
          66%       { transform: translate(-10px, 10px) scale(0.95); }
        }
        @keyframes rx-badge-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rx-check-pop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Root & Theme ── */
        .rx-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F0F2FA;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: #111827;
        }

        /* ── Ambient Background ── */
        .rx-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          overflow: hidden;
        }
        .rx-orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: rx-orb-drift 12s ease-in-out infinite;
        }
        .rx-orb-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%);
          top: -120px; right: -100px; animation-delay: 0s;
        }
        .rx-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%);
          top: 45%; left: -100px; animation-delay: -4s;
        }
        .rx-orb-3 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%);
          bottom: 120px; right: -60px; animation-delay: -8s;
        }
        .rx-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Layout ── */
        .rx-content {
          position: relative; z-index: 1;
          padding: 52px 20px 100px;
          display: flex; flex-direction: column; gap: 22px;
          max-width: 540px; margin: 0 auto;
        }

        /* ── Page Header ── */
        .rx-header { animation: rx-fade-up 0.5s ease forwards; }
        .rx-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px 4px 8px; border-radius: 100px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.22);
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #4f46e5; margin-bottom: 12px;
          animation: rx-badge-in 0.6s 0.15s ease forwards; opacity: 0;
        }
        .rx-chip-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 6px rgba(99,102,241,0.6);
          animation: rx-pulse-ring 2s ease-out infinite;
        }
        .rx-title {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 800; color: #0f172a;
          line-height: 1.08; letter-spacing: -0.8px;
          margin: 0 0 6px;
        }
        .rx-title span {
          background: linear-gradient(135deg, #6366F1, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rx-sub {
          font-size: 13px; color: rgba(15,23,42,0.5); font-weight: 400; line-height: 1.5;
        }

        /* ── Upload Zone ── */
        .rx-upload-zone {
          border-radius: 24px;
          border: 1.5px dashed rgba(99,102,241,0.3);
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 40px 24px 36px;
          display: flex; flex-direction: column; align-items: center; gap: 22px;
          text-align: center;
          position: relative; overflow: hidden;
          animation: rx-fade-up 0.5s 0.1s ease forwards; opacity: 0;
          cursor: default;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .rx-upload-zone:hover {
          border-color: rgba(99,102,241,0.5);
          background: rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,1);
        }
        .rx-upload-zone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.05), transparent);
          pointer-events: none;
        }

        .rx-icon-wrap {
          position: relative;
          width: 80px; height: 80px;
          animation: rx-float 5s ease-in-out infinite;
        }
        .rx-icon-ring {
          width: 80px; height: 80px; border-radius: 26px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2));
          border: 1px solid rgba(99,102,241,0.35);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; z-index: 1;
        }
        .rx-icon-ring-glow {
          position: absolute; inset: -8px; border-radius: 34px;
          background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%);
          animation: rx-pulse-ring 2.5s ease-out infinite;
          z-index: 0;
        }

        .rx-upload-title {
          font-family: 'Fraunces', serif;
          font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 4px;
        }
        .rx-upload-sub { font-size: 12px; color: rgba(15,23,42,0.45); font-weight: 400; }

        .rx-btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        .rx-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #6366F1, #818CF8);
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden;
        }
        .rx-btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          opacity: 0; transition: opacity 0.3s;
        }
        .rx-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .rx-btn-primary:hover::after { opacity: 1; animation: rx-shimmer 0.8s ease; }
        .rx-btn-primary:active { transform: scale(0.97); }

        .rx-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 14px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          background: rgba(255,255,255,0.8);
          color: #374151;
          border: 1px solid rgba(15,23,42,0.12);
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
          transition: background 0.2s, transform 0.15s, border-color 0.2s, box-shadow 0.2s;
        }
        .rx-btn-outline:hover {
          background: #ffffff;
          border-color: rgba(99,102,241,0.3);
          box-shadow: 0 4px 14px rgba(99,102,241,0.12);
          transform: translateY(-1px);
        }
        .rx-btn-outline:active { transform: scale(0.97); }
        .rx-btn-full { width: 100%; justify-content: center; }

        /* ── Preview Card ── */
        .rx-preview-card {
          border-radius: 22px; overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.09);
          box-shadow: 0 8px 32px rgba(15,23,42,0.1), 0 2px 8px rgba(15,23,42,0.06);
          animation: rx-pop-in 0.45s ease forwards;
        }
        .rx-preview-img-wrap {
          position: relative; overflow: hidden;
        }
        .rx-preview-img {
          width: 100%; height: 210px; object-fit: cover; display: block;
          filter: brightness(0.92);
        }

        /* Scanner corners */
        .rx-scanner-corners {
          position: absolute; inset: 10px;
          pointer-events: none;
          animation: rx-scan-corner 1.8s ease-in-out infinite;
        }
        .rx-corner {
          position: absolute; width: 22px; height: 22px;
          border-color: rgba(99,102,241,0.85); border-style: solid;
        }
        .rx-corner-tl { top: 0; left: 0; border-width: 2.5px 0 0 2.5px; border-radius: 4px 0 0 0; }
        .rx-corner-tr { top: 0; right: 0; border-width: 2.5px 2.5px 0 0; border-radius: 0 4px 0 0; }
        .rx-corner-bl { bottom: 0; left: 0; border-width: 0 0 2.5px 2.5px; border-radius: 0 0 0 4px; }
        .rx-corner-br { bottom: 0; right: 0; border-width: 0 2.5px 2.5px 0; border-radius: 0 0 4px 0; }

        /* Scan beam */
        .rx-scan-beam {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.9) 30%, rgba(6,182,212,0.7) 70%, transparent);
          box-shadow: 0 0 16px rgba(99,102,241,0.5), 0 0 32px rgba(99,102,241,0.2);
          animation: rx-scan-beam 2s cubic-bezier(0.4,0,0.2,1) infinite;
        }
        .rx-scan-beam-glow {
          position: absolute; left: 0; right: 0; height: 60px;
          background: linear-gradient(to bottom, rgba(99,102,241,0.1), transparent);
          animation: rx-scan-beam 2s cubic-bezier(0.4,0,0.2,1) infinite;
          margin-top: -30px;
        }

        /* Loading bar */
        .rx-loading-bar-wrap {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px;
          background: rgba(15,23,42,0.06);
        }
        .rx-loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366F1, #06b6d4);
          animation: rx-progress 8s ease forwards;
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
        }

        /* Loading overlay */
        .rx-loading-overlay {
          padding: 18px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          border-top: 1px solid rgba(15,23,42,0.07);
          background: linear-gradient(to right, rgba(99,102,241,0.04), rgba(6,182,212,0.03));
          position: relative;
        }
        .rx-loading-top {
          display: flex; align-items: center; gap: 10px; width: 100%;
        }
        .rx-loading-spinner-wrap {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rx-loading-text-wrap { flex: 1; }
        .rx-loading-label {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #4f46e5;
        }
        .rx-loading-step {
          font-size: 10px; color: rgba(15,23,42,0.4); margin-top: 1px;
          display: flex; align-items: center; gap: 4px;
        }
        .rx-dots span {
          display: inline-block; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(99,102,241,0.5);
          animation: rx-dot-bounce 1.2s ease-in-out infinite;
          margin: 0 1px;
        }
        .rx-dots span:nth-child(2) { animation-delay: 0.2s; }
        .rx-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── Result Header ── */
        .rx-result-header {
          display: flex; align-items: center; gap: 12px;
          animation: rx-fade-up 0.4s ease forwards;
        }
        .rx-check-badge {
          width: 40px; height: 40px; border-radius: 14px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.22);
          display: flex; align-items: center; justify-content: center;
          animation: rx-check-pop 0.5s 0.1s ease forwards; opacity: 0;
          box-shadow: 0 4px 16px rgba(16,185,129,0.12);
        }
        .rx-result-title {
          font-family: 'Fraunces', serif;
          font-size: 19px; font-weight: 800; color: #0f172a;
        }
        .rx-result-sub { font-size: 11px; color: rgba(15,23,42,0.4); margin-top: 1px; }

        /* ── Medicine Card ── */
        .rx-med-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px; padding: 18px;
          display: flex; flex-direction: column; gap: 14px;
          position: relative; overflow: hidden;
          opacity: 0;
          animation: rx-fade-up 0.45s ease forwards;
          box-shadow: 0 2px 12px rgba(15,23,42,0.06);
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }
        .rx-med-card:hover {
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 8px 28px rgba(99,102,241,0.1);
          transform: translateY(-2px);
        }
        .rx-med-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }
        .rx-med-card-num {
          position: absolute; top: 16px; right: 18px;
          font-family: 'Fraunces', serif; font-size: 34px; font-weight: 800;
          color: rgba(99,102,241,0.07); line-height: 1; pointer-events: none;
          user-select: none;
        }

        .rx-med-top { display: flex; align-items: flex-start; gap: 14px; }
        .rx-med-icon-wrap {
          position: relative;
          width: 48px; height: 48px; flex-shrink: 0;
        }
        .rx-med-icon {
          width: 48px; height: 48px; border-radius: 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
          border: 1px solid rgba(99,102,241,0.18);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(99,102,241,0.15);
        }
        .rx-med-name {
          font-family: 'Fraunces', serif;
          font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.2;
        }
        .rx-med-dosage {
          font-size: 12px; font-weight: 600; color: #6366f1; margin-top: 3px;
          display: flex; align-items: center; gap: 5px;
        }
        .rx-med-dosage::before {
          content: '';
          display: inline-block; width: 5px; height: 5px; border-radius: 50%;
          background: #6366f1; box-shadow: 0 0 5px rgba(99,102,241,0.4);
        }

        /* Description */
        .rx-description {
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.14);
          border-radius: 12px; padding: 11px 14px;
          display: flex; gap: 10px; align-items: flex-start;
        }
        .rx-description-text {
          font-size: 11.5px; color: rgba(15,23,42,0.6); line-height: 1.65; font-weight: 400;
        }

        /* Meta grid */
        .rx-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .rx-meta-cell {
          background: #F8F9FC;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 14px; padding: 12px 14px;
          transition: background 0.2s, border-color 0.2s;
        }
        .rx-meta-cell:hover {
          background: rgba(99,102,241,0.05);
          border-color: rgba(99,102,241,0.18);
        }
        .rx-meta-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(15,23,42,0.35); margin-bottom: 6px;
        }
        .rx-meta-value {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #111827; line-height: 1.3;
        }

        /* Advisory */
        .rx-advisory {
          background: rgba(251,191,36,0.07);
          border: 1px solid rgba(251,191,36,0.22);
          border-radius: 14px; padding: 12px 14px;
          display: flex; gap: 10px; align-items: flex-start;
          position: relative; overflow: hidden;
        }
        .rx-advisory::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
          border-radius: 0 2px 2px 0;
        }
        .rx-advisory-text {
          font-size: 11.5px; color: rgba(15,23,42,0.6); line-height: 1.65; padding-left: 2px;
        }

        /* General advice */
        .rx-general-advice {
          background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.04));
          border: 1px solid rgba(99,102,241,0.16);
          border-radius: 22px; padding: 20px;
          display: flex; gap: 14px; align-items: flex-start;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(99,102,241,0.07);
          animation: rx-fade-up 0.4s ease forwards; opacity: 0;
        }
        .rx-general-advice::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 80% at 0% 0%, rgba(99,102,241,0.06), transparent);
          pointer-events: none;
        }
        .rx-advice-icon {
          width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(99,102,241,0.12);
        }
        .rx-advice-title {
          font-family: 'Fraunces', serif;
          font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 6px;
          display: flex; align-items: center; gap: 6px;
        }
        .rx-advice-text {
          font-size: 12px; color: rgba(15,23,42,0.55); line-height: 1.7;
        }

        /* Empty / Error card */
        .rx-empty-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px; padding: 40px 24px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(15,23,42,0.06);
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          animation: rx-pop-in 0.4s ease forwards;
        }
        .rx-empty-icon {
          width: 60px; height: 60px; border-radius: 20px;
          background: rgba(251,191,36,0.09); border: 1px solid rgba(251,191,36,0.22);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(251,191,36,0.12);
        }
        .rx-empty-title {
          font-family: 'Fraunces', serif;
          font-size: 17px; font-weight: 700; color: #0f172a;
        }
        .rx-empty-sub {
          font-size: 13px; color: rgba(15,23,42,0.45); line-height: 1.6; max-width: 260px;
        }

        /* Divider with label */
        .rx-divider {
          display: flex; align-items: center; gap: 10px;
        }
        .rx-divider-line {
          flex: 1; height: 1px; background: rgba(15,23,42,0.08);
        }
        .rx-divider-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(15,23,42,0.3);
        }

        /* Utility */
        .hidden-input { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="rx-root">
        
        <div className="rx-bg">
          <div className="rx-grid" />
          <div className="rx-orb rx-orb-1" />
          <div className="rx-orb rx-orb-2" />
          <div className="rx-orb rx-orb-3" />
        </div>

        <div className="rx-content">

          
          <div className="rx-header">
            <div className="rx-chip">
              <span className="rx-chip-dot" />
              AI-Powered Scan
            </div>
            <h1 className="rx-title">
              Scan Your<br />
              <span>Prescription</span>
            </h1>
            <p className="rx-sub">Upload or capture a prescription image to extract medicine details</p>
          </div>

          
          {!previewUrl && !loading && (
            <div className="rx-upload-zone">
              <div className="rx-icon-wrap">
                <div className="rx-icon-ring-glow" />
                <div className="rx-icon-ring">
                  <Pill size={32} color="#6366F1" />
                </div>
              </div>
              <div>
                <div className="rx-upload-title">Upload Prescription</div>
                <div className="rx-upload-sub">Take a photo or choose from your gallery</div>
              </div>
              <div className="rx-btn-row">
                <button className="rx-btn-primary" onClick={() => cameraInputRef.current?.click()}>
                  <Camera size={16} />
                  Camera
                </button>
                <button className="rx-btn-outline" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={16} />
                  Gallery
                </button>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden-input" onChange={onFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden-input" onChange={onFileChange} />

          
          {previewUrl && (
            <div className="rx-preview-card">
              <div className="rx-preview-img-wrap">
                <img src={previewUrl} alt="Prescription" className="rx-preview-img" />

                
                {loading && (
                  <>
                    <div className="rx-scan-beam-glow" />
                    <div className="rx-scan-beam" />
                    <div className="rx-scanner-corners">
                      <div className="rx-corner rx-corner-tl" />
                      <div className="rx-corner rx-corner-tr" />
                      <div className="rx-corner rx-corner-bl" />
                      <div className="rx-corner rx-corner-br" />
                    </div>
                  </>
                )}

                <div className="rx-loading-bar-wrap">
                  {loading && <div className="rx-loading-bar" />}
                </div>
              </div>

              {loading && (
                <div className="rx-loading-overlay">
                  <div className="rx-loading-top">
                    <div className="rx-loading-spinner-wrap">
                      <Loader2
                        size={16}
                        color="#6366F1"
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    </div>
                    <div className="rx-loading-text-wrap">
                      <div className="rx-loading-label">Analyzing with AI…</div>
                      <div className="rx-loading-step">
                        Extracting medicine details
                        <span className="rx-dots">
                          <span /><span /><span />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          
          {results && results.medicines && results.medicines.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="rx-result-header">
                <div className="rx-check-badge">
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
                <div>
                  <div className="rx-result-title">
                    {results.medicines.length} Medicine{results.medicines.length > 1 ? "s" : ""} Found
                  </div>
                  <div className="rx-result-sub">Tap a card for details</div>
                </div>
              </div>

              {results.medicines.map((med, i) => (
                <div
                  key={i}
                  className="rx-med-card"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <div className="rx-med-card-num">{String(i + 1).padStart(2, "0")}</div>

                  <div className="rx-med-top">
                    <div className="rx-med-icon-wrap">
                      <div className="rx-med-icon">
                        <Pill size={22} color="#6366F1" />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="rx-med-name">{med.name}</div>
                      <div className="rx-med-dosage">{med.dosage}</div>
                    </div>
                  </div>

                  {med.description && (
                    <div className="rx-description">
                      <Info size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span className="rx-description-text">{med.description}</span>
                    </div>
                  )}

                  <div className="rx-meta-grid">
                    <div className="rx-meta-cell">
                      <div className="rx-meta-label">
                        <Clock size={9} color="rgba(15,23,42,0.3)" />
                        Frequency
                      </div>
                      <div className="rx-meta-value">{med.frequency}</div>
                    </div>
                    <div className="rx-meta-cell">
                      <div className="rx-meta-label">
                        <Clock size={9} color="rgba(15,23,42,0.3)" />
                        Duration
                      </div>
                      <div className="rx-meta-value">{med.duration}</div>
                    </div>
                  </div>

                  <div className="rx-advisory">
                    <AlertTriangle size={15} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span className="rx-advisory-text">{med.advisory}</span>
                  </div>
                </div>
              ))}

              
              {results.generalAdvice && (
                <div className="rx-divider">
                  <div className="rx-divider-line" />
                  <span className="rx-divider-label">Advisory</span>
                  <div className="rx-divider-line" />
                </div>
              )}

              {results.generalAdvice && (
                <div
                  className="rx-general-advice"
                  style={{ animationDelay: `${0.1 + results.medicines.length * 0.08 + 0.1}s` }}
                >
                  <div className="rx-advice-icon">
                    <span style={{ fontSize: 20 }}>⚕️</span>
                  </div>
                  <div>
                    <div className="rx-advice-title">General Advisory</div>
                    <div className="rx-advice-text">{results.generalAdvice}</div>
                  </div>
                </div>
              )}

              <button
                className="rx-btn-outline rx-btn-full"
                style={{ marginTop: 4 }}
                onClick={() => {
                  setResults(null);
                  setPreviewUrl(null);
                }}
              >
                <Camera size={15} />
                Scan Another Prescription
              </button>
            </div>
          )}

          
          {results && (!results.medicines || results.medicines.length === 0) && (
            <div className="rx-empty-card">
              <div className="rx-empty-icon">
                <AlertTriangle size={26} color="#FBBF24" />
              </div>
              <div className="rx-empty-title">No medicines detected</div>
              <div className="rx-empty-sub">
                {results.generalAdvice || "Please try uploading a clearer image of the prescription."}
              </div>
              <button
                className="rx-btn-outline"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setResults(null);
                  setPreviewUrl(null);
                }}
              >
                <Camera size={15} />
                Try Again
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
