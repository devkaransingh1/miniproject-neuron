import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/use-auth";

function AuthStatus({ children }) {
  const { error, refreshAuth } = useAuth();

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md text-center">
          <p className="text-lg font-medium">Unable to check your session</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The authentication service could not be reached. Check your
            connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refreshAuth()}
            className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm text-background"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return children;
}

function CheckingSession() {
  return (
    <main
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background text-foreground"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"
        />
        Checking your session…
      </div>
    </main>
  );
}

export function PublicOnlyRoute({ children }) {
  const { status } = useAuth();

  if (status === "checking") return <CheckingSession />;
  if (status === "authenticated") {
    return <Navigate to="/chat" replace />;
  }

  return <AuthStatus>{children}</AuthStatus>;
}

export function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "checking") return <CheckingSession />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <AuthStatus>{children}</AuthStatus>;
}
