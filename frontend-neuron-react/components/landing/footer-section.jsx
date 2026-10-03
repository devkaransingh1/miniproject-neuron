"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
const footerLinks = {
  Product: [
    { name: "Agent capabilities", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#integrations" },
  ],
  Developers: [
    { name: "Documentation", href: "#developers" },
    { name: "Agent SDK", href: "#" },
    { name: "API Reference", href: "#developers" },
    { name: "Status", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#", badge: "Hiring" },
    { name: "Contact", href: "#" },
  ],
  Legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Security", href: "#security" },
  ],
};
const socialLinks = [
  { name: "Twitter", href: "#" },
  { name: "GitHub", href: "#" },
  { name: "LinkedIn", href: "#" },
];
function AnimatedWaveCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId;
    let time = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(100, 200, 150, 0.3)";
      ctx.lineWidth = 1;
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y =
            height * 0.5 +
            Math.sin(x * 0.01 + time + wave * 0.5) * 30 +
            Math.sin(x * 0.02 + time * 1.5 + wave) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  return _jsx("canvas", { ref: canvasRef, className: "w-full h-full" });
}
export function FooterSection() {
  return _jsxs("footer", {
    className: "relative bg-black",
    children: [
      _jsxs("div", {
        className: "relative w-full h-[340px] md:h-[420px] overflow-hidden",
        children: [
          _jsx("img", {
            src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2810%29-UnDKstODkIENp5xqTYUEpt0Sm8tNOw.png",
            alt: "Bioluminescent landscape",
            className: "w-full h-full object-cover object-center",
          }),
          _jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black",
          }),
          _jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40",
          }),
        ],
      }),
      _jsxs("div", {
        className: "relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12",
        children: [
          _jsx("div", {
            className: "py-16 lg:py-20",
            children: _jsxs("div", {
              className: "grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8",
              children: [
                _jsxs("div", {
                  className: "col-span-2",
                  children: [
                    _jsxs("a", {
                      href: "#",
                      className: "inline-flex items-center gap-2 mb-6",
                      children: [
                        _jsx("span", {
                          className: "text-2xl font-display text-white",
                          children: "Neuron",
                        }),
                        _jsx("span", {
                          className: "text-xs text-white/40 font-mono",
                          children: "TM",
                        }),
                      ],
                    }),
                    _jsx("p", {
                      className:
                        "text-white/50 leading-relaxed mb-8 max-w-xs text-sm",
                      children: "Multi system integrated AI query platform",
                    }),
                    _jsx("div", {
                      className: "flex gap-6",
                      children: socialLinks.map((link) =>
                        _jsxs(
                          "a",
                          {
                            href: link.href,
                            className:
                              "text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group",
                            children: [
                              link.name,
                              _jsx(ArrowUpRight, {
                                className:
                                  "w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all",
                              }),
                            ],
                          },
                          link.name,
                        ),
                      ),
                    }),
                  ],
                }),
                Object.entries(footerLinks).map(([title, links]) =>
                  _jsxs(
                    "div",
                    {
                      children: [
                        _jsx("h3", {
                          className: "text-sm font-medium text-white mb-6",
                          children: title,
                        }),
                        _jsx("ul", {
                          className: "space-y-4",
                          children: links.map((link) =>
                            _jsx(
                              "li",
                              {
                                children: _jsxs("a", {
                                  href: link.href,
                                  className:
                                    "text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-2",
                                  children: [
                                    link.name,
                                    "badge" in link &&
                                      link.badge &&
                                      _jsx("span", {
                                        className:
                                          "text-xs px-2 py-0.5 bg-white text-black rounded-full",
                                        children: link.badge,
                                      }),
                                  ],
                                }),
                              },
                              link.name,
                            ),
                          ),
                        }),
                      ],
                    },
                    title,
                  ),
                ),
              ],
            }),
          }),
          _jsxs("div", {
            className:
              "py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4",
            children: [
              _jsx("p", {
                className: "text-sm text-white/30",
                children: "\u00A9 2026 Neuron. All rights reserved.",
              }),
              _jsx("div", {
                className: "flex items-center gap-4 text-sm text-white/30",
                children: _jsxs("span", {
                  className: "flex items-center gap-2",
                  children: [
                    _jsx("span", {
                      className: "w-2 h-2 rounded-full bg-[#eca8d6]",
                    }),
                    "All agents operational",
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
