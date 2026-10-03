import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/auth/auth-routes";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InfrastructureSection } from "@/components/landing/infrastructure-section";
import { MetricsSection } from "@/components/landing/metrics-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { SecuritySection } from "@/components/landing/security-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";
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

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
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
              <Suspense fallback={<LoadingChatPage />}>
                <ChatPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
