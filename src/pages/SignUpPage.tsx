import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithEmail } from "@/auth";
import AuthFrame from "@/components/AuthFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail(email.trim(), password, name.trim());
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      badge="Create account"
      title="Create account"
      description="Set up your profile in a few steps."
      formTitle="Sign up"
      formDescription="Add your details to create an account."
      footer={(
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full name</Label>
          <Input
            id="signup-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            placeholder="John Doe"
            className="h-12 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            placeholder="Create a password"
            className="h-12 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm-password">Confirm password</Label>
          <Input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="h-12 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all hover:shadow-[0_20px_36px_rgba(37,99,235,0.30)]" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthFrame>
  );
}
