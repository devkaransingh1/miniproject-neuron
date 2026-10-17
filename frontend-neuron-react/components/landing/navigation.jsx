"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonColorful } from "@/components/ui/button-colorful";

export function Navigation() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          <a href="#" className="flex items-center gap-2 group">
            <span
              className={`font-display tracking-tight transition-all duration-500 ${
                isScrolled ? "text-xl text-foreground" : "text-2xl text-white"
              }`}
            >
              NEURON
            </span>
            <span
              className={`font-mono transition-all duration-500 ${
                isScrolled
                  ? "text-[10px] mt-0.5 text-muted-foreground"
                  : "text-xs mt-1 text-white/60"
              }`}
            >
              TM
            </span>
          </a>

          <div className="flex items-center gap-4">
            <ButtonColorful
              label="Sign in"
              onClick={() => navigate("/login")}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
