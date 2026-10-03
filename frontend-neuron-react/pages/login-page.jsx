import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/use-auth";
import { startGoogleLogin } from "@/services/auth-api";
import { ButtonColorful } from "@/components/ui/button-colorful";

export function LoginPage() {
  const { error, refreshAuth } = useAuth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.16),transparent_58%)]"
      />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <Link
          to="/"
          className="font-display text-sm tracking-[0.24em] text-white/55 transition-colors hover:text-white"
        >
          NEURON
        </Link>
        <h1 className="mt-8 font-display text-4xl tracking-tight">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Sign in to continue to your Neuron workspace.
        </p>
        <ButtonColorful
          label="Sign in with Google"
          className="mt-8 h-12 w-full justify-center px-6"
          onClick={startGoogleLogin}
        />
        {error && (
          <div className="mt-6">
            <p role="alert" className="text-sm text-red-300">
              We couldn’t check your session. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refreshAuth()}
              className="mt-2 text-sm text-white/70 underline underline-offset-4 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
