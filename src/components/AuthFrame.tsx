import type { ReactNode } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthFrameProps = {
  badge: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  footer: ReactNode;
  children: ReactNode;
};

export default function AuthFrame({
  badge,
  title,
  description,
  formTitle,
  formDescription,
  footer,
  children,
}: AuthFrameProps) {
  return (
    <main className="auth-shell min-h-screen overflow-hidden bg-[#eef3fb] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @keyframes auth-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes auth-rise { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes auth-drift { 0%,100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(18px, -14px) scale(1.05); } }

        .auth-shell {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          color: #0f172a;
        }

        .auth-shell::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 25%, black 28%, transparent 100%);
          opacity: 0.7;
        }

        .auth-orb {
          position: fixed;
          border-radius: 999px;
          filter: blur(90px);
          pointer-events: none;
          animation: auth-drift 16s ease-in-out infinite;
        }

        .auth-orb-one {
          width: 360px;
          height: 360px;
          top: -120px;
          right: -120px;
          background: radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%);
        }

        .auth-orb-two {
          width: 280px;
          height: 280px;
          left: -100px;
          top: 45%;
          background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%);
          animation-delay: -5s;
        }

        .auth-orb-three {
          width: 220px;
          height: 220px;
          right: 12%;
          bottom: -90px;
          background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
          animation-delay: -9s;
        }

        .auth-fade-up {
          opacity: 0;
          animation: auth-fade-up 0.55s cubic-bezier(0.22, 0.68, 0, 1.05) forwards;
        }

        .auth-card {
          border: 1px solid rgba(255,255,255,0.74);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.86));
          box-shadow:
            0 24px 80px rgba(29,78,216,0.12),
            0 2px 10px rgba(15,23,42,0.04);
          backdrop-filter: blur(18px);
        }

        .auth-logo-shell {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.84));
          border: 1px solid rgba(255,255,255,0.82);
          box-shadow: 0 10px 28px rgba(37,99,235,0.16);
          padding: 0.35rem;
          animation: auth-rise 0.5s ease both;
        }

        .auth-logo-shell img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .auth-subtle-line {
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);
        }

      `}</style>

      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div className="auth-orb auth-orb-three" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex items-center justify-between gap-4 auth-fade-up">
          <div className="flex items-center gap-3">
            <div className="auth-logo-shell">
              <img src="/favicon.png" alt="MediSphere logo" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">MediSphere</p>
              <p className="text-sm text-slate-600">Patient access</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-sm sm:flex">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Secure access
          </div>
        </div>

        <section className="auth-fade-up mx-auto w-full" style={{ animationDelay: "0.08s" }}>
          <div className="auth-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {badge}
              </div>
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
            </div>

            <div className="mb-6 space-y-2">
              <h1 className="font-['Fraunces'] text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            <div className="mb-5 space-y-3">
              <div className="auth-subtle-line" />
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">Secure</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Fast access</span>
              </div>
            </div>

            <Card className="overflow-hidden border-white/90 bg-white/96 shadow-none">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
              <CardHeader className="space-y-2 pb-3 pt-5">
                <CardTitle className="font-['Fraunces'] text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                  {formTitle}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  {formDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {children}
                {footer}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}