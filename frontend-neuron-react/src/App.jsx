import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/auth/auth-routes";
import { AuthProvider } from "@/components/auth/auth-provider";
import { useAuth } from "@/components/auth/use-auth";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { LoginPage } from "@/pages/login-page";

const ChatPage = lazy(() =>
  import("@/pages/chat-page").then((module) => ({
    default: module.ChatPage,
  })),
);

function LoadingChatPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] text-sm text-white/45">
      Loading your workspace…
    </main>
  );
}

function AuthenticatedChatPage() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingChatPage />}>
      <ChatPage key={user?.email ?? "authenticated-user"} />
    </Suspense>
  );
}

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black">
      <Navigation />
      <HeroSection />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AuthenticatedChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
