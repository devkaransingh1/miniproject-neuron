"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
const regions = [
    { name: "North America", nodes: 12, status: "operational" },
    { name: "Europe", nodes: 8, status: "operational" },
    { name: "Asia Pacific", nodes: 6, status: "operational" },
    { name: "South America", nodes: 3, status: "operational" },
];
export function InfrastructureSection() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeRegion, setActiveRegion] = useState(0);
    const sectionRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting)
                setIsVisible(true);
        }, { threshold: 0.1 });
        if (sectionRef.current)
            observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveRegion((prev) => (prev + 1) % regions.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (_jsx("section", { id: "infra", ref: sectionRef, className: "relative py-32 lg:py-40 overflow-hidden", children: _jsxs("div", { className: "max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsxs("div", { className: "mb-20", children: [_jsxs("span", { className: `inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`, children: [_jsx("span", { className: "w-12 h-px bg-foreground/20" }), "Global infrastructure"] }), _jsxs("div", { className: "grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-stretch", children: [_jsx("div", { className: `w-48 lg:w-72 xl:w-80 shrink-0 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: _jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/world-3i68QNWJwmO7W19ztZWbevAwJQHzYL.png", alt: "Global network sphere", className: "w-full h-full object-contain object-center" }) }), _jsxs("div", { className: "flex flex-col justify-center", children: [_jsxs("h2", { className: `text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: ["Global by", _jsx("br", {}), _jsx("span", { className: "text-muted-foreground", children: "default." })] }), _jsx("p", { className: `mt-8 text-xl text-muted-foreground leading-relaxed max-w-lg transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`, children: "Your agents run on distributed infrastructure across 29 regions. Sub-50ms latency to 99% of the world." })] })] })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: `lg:col-span-2 relative p-8 lg:p-12 border border-foreground/10 bg-foreground/[0.02] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsxs("div", { className: "absolute inset-0 opacity-70", children: [_jsxs("svg", { className: "absolute inset-0 w-full h-full", style: { pointerEvents: "none" }, children: [_jsx("defs", { children: _jsx("style", { children: `
                    @keyframes drawLine {
                      0%   { stroke-dashoffset: 1000; opacity: 0; }
                      15%  { opacity: 1; }
                      70%  { opacity: 0.7; }
                      100% { stroke-dashoffset: 0; opacity: 0; }
                    }
                    .connecting-line {
                      stroke: #eca8d6;
                      stroke-width: 1.2;
                      fill: none;
                      stroke-dasharray: 1000;
                      animation: drawLine 3s ease-in-out infinite;
                    }
                  ` }) }), [...Array(19)].map((_, i) => {
                                                    const x1 = 10 + (i % 5) * 20;
                                                    const y1 = 10 + Math.floor(i / 5) * 25;
                                                    const x2 = 10 + ((i + 1) % 5) * 20;
                                                    const y2 = 10 + Math.floor((i + 1) / 5) * 25;
                                                    return (_jsx("line", { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%`, className: "connecting-line", style: { animationDelay: `${i * 0.15}s` } }, `line-${i}`));
                                                })] }), [...Array(20)].map((_, i) => (_jsx("div", { className: "absolute w-1.5 h-1.5 rounded-full bg-[#eca8d6]", style: {
                                                left: `${10 + (i % 5) * 20}%`,
                                                top: `${10 + Math.floor(i / 5) * 25}%`,
                                                animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                                            } }, i)))] }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [_jsx("span", { className: "text-8xl lg:text-[10rem] font-display leading-none", children: "29" }), _jsx("span", { className: "text-2xl text-muted-foreground", children: "regions" })] }), _jsx("p", { className: "text-muted-foreground max-w-md", children: "Compute nodes distributed globally for maximum redundancy and minimum latency." })] })] }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: `p-8 border border-foreground/10 bg-foreground/[0.02] transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsx("span", { className: "text-5xl lg:text-6xl font-display", children: "99.99%" }), _jsx("span", { className: "block text-sm text-muted-foreground mt-2", children: "Uptime SLA" })] }), _jsxs("div", { className: `p-8 border border-foreground/10 bg-foreground/[0.02] transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsx("span", { className: "text-5xl lg:text-6xl font-display", children: "<50ms" }), _jsx("span", { className: "block text-sm text-muted-foreground mt-2", children: "Global latency" })] })] })] }), _jsx("div", { className: `mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`, children: regions.map((region, index) => (_jsxs("div", { className: `p-6 border transition-all duration-300 cursor-default ${activeRegion === index
                            ? "border-foreground/30 bg-foreground/[0.04]"
                            : "border-foreground/10"}`, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `w-2 h-2 rounded-full transition-colors ${activeRegion === index ? "bg-[#eca8d6]" : "bg-foreground/20"}` }), _jsx("span", { className: "text-xs font-mono text-muted-foreground uppercase tracking-wider", children: region.status })] }), _jsx("span", { className: "font-medium block mb-1", children: region.name }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [region.nodes, " nodes"] })] }, region.name))) })] }) }));
}
