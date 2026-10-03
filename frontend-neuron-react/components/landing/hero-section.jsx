"use client";

import { useEffect, useRef, useState } from "react";
import { IntegrationCard } from "@/components/ui/integration-card";
import { Component as SilkBackground } from "@/components/ui/silk-background-animation";

const words = ["Gmail", "Calendar", "Github", "everything"];

function BlurWord({ word, trigger }) {
  const letters = word.split("");
  const STAGGER = 45;
  const DURATION = 500;
  const GRADIENT_HOLD = STAGGER * letters.length + DURATION + 200;
  const [letterStates, setLetterStates] = useState(
    letters.map(() => ({ opacity: 0, blur: 20 })),
  );
  const [showGradient, setShowGradient] = useState(true);
  const framesRef = useRef([]);
  const timersRef = useRef([]);

  useEffect(() => {
    framesRef.current.forEach(cancelAnimationFrame);
    timersRef.current.forEach(clearTimeout);
    framesRef.current = [];
    timersRef.current = [];
    setLetterStates(letters.map(() => ({ opacity: 0, blur: 20 })));
    setShowGradient(true);

    letters.forEach((_, i) => {
      const timer = setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setLetterStates((previous) => {
            const next = [...previous];
            next[i] = { opacity: eased, blur: 20 * (1 - eased) };
            return next;
          });
          if (progress < 1) {
            const frame = requestAnimationFrame(tick);
            framesRef.current.push(frame);
          }
        };
        const frame = requestAnimationFrame(tick);
        framesRef.current.push(frame);
      }, i * STAGGER);
      timersRef.current.push(timer);
    });

    const gradientTimer = setTimeout(
      () => setShowGradient(false),
      GRADIENT_HOLD,
    );
    timersRef.current.push(gradientTimer);

    return () => {
      framesRef.current.forEach(cancelAnimationFrame);
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const gradientColors = [
    "#eca8d6",
    "#a78bfa",
    "#67e8f9",
    "#fbbf24",
    "#eca8d6",
  ];

  return (
    <>
      {letters.map((char, i) => {
        const colorIndex =
          (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1);
        const lower = Math.floor(colorIndex);
        const upper = Math.min(lower + 1, gradientColors.length - 1);
        const t = colorIndex - lower;
        const hexToRgb = (hex) => [
          parseInt(hex.slice(1, 3), 16),
          parseInt(hex.slice(3, 5), 16),
          parseInt(hex.slice(5, 7), 16),
        ];
        const [r1, g1, b1] = hexToRgb(gradientColors[lower]);
        const [r2, g2, b2] = hexToRgb(gradientColors[upper]);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: letterStates[i]?.opacity ?? 0,
              filter: `blur(${letterStates[i]?.blur ?? 20}px)`,
              color: showGradient ? `rgb(${r},${g},${b})` : "white",
              transition: "color 0.4s ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((previous) => (previous + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <SilkBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 flex w-full flex-1 items-center px-6 pb-12 pt-28 sm:px-8 lg:px-12 lg:pb-14 lg:pt-32">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-10 xl:gap-16">
            <div>
              <div
                className={`mb-7 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <span className="inline-flex items-center gap-3 text-xs font-mono text-white/60 sm:text-sm">
                  <span className="w-8 h-px bg-white/30" />
                  Multi-source AI agent for personal data
                </span>
              </div>
              <div className="mb-8 lg:mb-0">
                <h1
                  className={`text-left text-[clamp(2.5rem,5.8vw,6.5rem)] font-display leading-[0.96] tracking-tight text-white transition-all duration-1000 [text-wrap:balance] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <span className="block">Create the context,</span>
                  <span className="block">
                    Sync your{" "}
                    <span className="relative inline-block whitespace-nowrap">
                      <BlurWord word={words[wordIndex]} trigger={wordIndex} />
                    </span>
                  </span>
                </h1>
              </div>
            </div>
            <div
              className={`w-full transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <IntegrationCard />
            </div>
          </div>

          <div
            className={`mt-12 flex flex-wrap items-start gap-x-8 gap-y-6 border-t border-white/10 pt-7 transition-all duration-700 delay-500 sm:gap-x-12 lg:mt-10 lg:pt-6 ${isVisible ? "opacity-100" : "opacity-0"}`}
          >
            {[
              { value: "3+", label: "Systems integrated" },
              { value: "90.0 %", label: "Realtime accurate answers" },
              { value: "<50ms", label: "Personalized query latency" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5">
                <span className="text-2xl font-display text-white sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-[11px] leading-tight text-white/50 sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
