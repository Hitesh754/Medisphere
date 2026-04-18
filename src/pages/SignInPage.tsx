import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle } from "@/auth";
import AuthFrame from "@/components/AuthFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(email.trim(), password);
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign in failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      badge="Sign in"
      title="Welcome back"
      description="Sign in to continue."
      formTitle="Sign in"
      formDescription="Enter your email and password."
      footer={(
        <p className="text-center text-sm text-slate-600">
          Do not have an account?{" "}
          <Link to="/signup" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      )}
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-slate-200 bg-white/90"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : "Continue with Google"}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Your password"
            className="h-12 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all hover:shadow-[0_20px_36px_rgba(37,99,235,0.30)]" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        </form>
      </div>
    </AuthFrame>
  );
}
