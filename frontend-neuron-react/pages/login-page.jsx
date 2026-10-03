import { useState } from "react";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/use-auth";
import { Button } from "@/components/ui/button";
import { startGoogleLogin } from "@/services/auth-api";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

function AmbientLines() {
  const paths = Array.from({ length: 22 }, (_, index) => {
    const offset = index * 14;
    return `M ${-280 - offset} ${-40 + offset} C ${40 - offset} ${
      120 + offset
    }, ${180 + offset} ${220 - offset}, ${540 + offset} ${420 - offset}`;
  });

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 720 760"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full text-blue-100"
    >
      {paths.map((path, index) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeOpacity={0.025 + (index % 6) * 0.009}
          className="animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${index * 95}ms` }}
        />
      ))}
    </svg>
  );
}

export function LoginPage() {
  const { error, refreshAuth } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    startGoogleLogin();
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#080808] text-white lg:grid-cols-2">
      <Link
        to="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55 backdrop-blur transition-colors hover:border-white/20 hover:text-white sm:left-8 sm:top-8"
      >
        <ArrowLeft className="size-3.5" />
        Home
      </Link>

      <aside className="relative hidden min-h-screen flex-col overflow-hidden border-r border-white/[0.07] bg-[#0b0c0f] p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_40%,rgba(96,120,164,0.16),transparent_55%)]"
        />
        <AmbientLines />

        <Link
          to="/"
          className="relative z-10 mt-16 inline-flex w-fit items-center gap-3"
        >
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045]">
            <Sparkles className="size-4 text-white/80" />
          </span>
          <span className="font-display text-sm tracking-[0.22em] text-white/85">
            NEURON
          </span>
        </Link>

        <div className="relative z-10 mt-auto max-w-lg pb-8">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
            Your context, connected
          </p>
          <h1 className="font-display text-5xl leading-[1.04] tracking-tight text-white xl:text-6xl">
            A second brain
            <br />
            for your whole life.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
            Bring your notes, plans, and connected knowledge together. Neuron
            helps you find the signal and move forward.
          </p>
          <div className="mt-9 flex items-center gap-2 text-xs text-white/35">
            <span className="size-1.5 rounded-full bg-emerald-400/80" />
            Private by design
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen items-center justify-center px-6 py-24 sm:px-10 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.045),transparent_54%)] lg:hidden"
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045]">
              <Sparkles className="size-4 text-white/80" />
            </span>
            <span className="font-display text-sm tracking-[0.22em] text-white/85">
              NEURON
            </span>
          </div>

          <div className="mb-9">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              Welcome to Neuron
            </p>
            <h2 className="font-display text-4xl tracking-tight text-white sm:text-[2.75rem]">
              Sign in or join.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/50">
              One secure sign-in with Google. Your connected context, ready
              when you are.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isRedirecting}
            style={{ color: "#111111" }}
            className="h-12 w-full gap-3 rounded-xl border border-white/[0.14] bg-white text-sm font-medium text-[#171717] shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/90"
          >
            {isRedirecting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <GoogleMark />
            )}
            <span style={{ color: "#111111" }}>
              {isRedirecting
                ? "Redirecting to Google…"
                : "Continue with Google"}
            </span>
          </Button>

          <p className="mt-5 text-center text-xs leading-5 text-white/30">
            No password to remember. Sign in securely with your Google account.
          </p>

          {error && (
            <div className="mt-7 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-center">
              <p role="alert" className="text-sm text-red-200/85">
                We couldn’t check your session. Please try again.
              </p>
              <button
                type="button"
                onClick={() => refreshAuth()}
                className="mt-2 text-sm text-white/65 underline underline-offset-4 transition-colors hover:text-white"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
