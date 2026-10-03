"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
const features = [
    {
        title: "TypeScript native",
        description: "Full type safety for agent configs and responses."
    },
    {
        title: "Streaming results",
        description: "Watch your agents think and act in real-time."
    },
    {
        title: "Multi-model support",
        description: "OpenAI, Anthropic, Mistral, or bring your own."
    },
    {
        title: "Local debugging",
        description: "Test agents locally before deploying to cloud."
    },
];
export function DevelopersSection() {
    const [isVisible, setIsVisible] = useState(false);
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
    return (_jsxs("section", { id: "developers", ref: sectionRef, className: "relative py-24 lg:py-32 overflow-hidden", children: [_jsxs("div", { className: `absolute bottom-0 right-0 w-[55%] h-[85%] pointer-events-none transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`, children: [_jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2813%29-OQ2DiR3ElVsUg8kTvTL1kC5A3Q6maM.png", alt: "", "aria-hidden": "true", className: "w-full h-full object-cover object-left-top" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" })] }), _jsxs("div", { className: "relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsxs("div", { className: `mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsxs("span", { className: "inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6", children: [_jsx("span", { className: "w-8 h-px bg-foreground/30" }), "Developer SDK"] }), _jsxs("h2", { className: "text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]", children: ["Code your agents.", _jsx("br", {}), _jsx("span", { className: "text-muted-foreground", children: "Or let them code." })] })] }), _jsxs("div", { className: `max-w-[50%] transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsx("p", { className: "text-xl text-muted-foreground mb-12 leading-relaxed max-w-md", children: "A powerful SDK for building, deploying, and orchestrating AI agents. Define behaviors in code or natural language." }), _jsx("div", { className: "grid grid-cols-2 gap-6", children: features.map((feature, index) => (_jsxs("div", { className: `transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, style: { transitionDelay: `${index * 50 + 200}ms` }, children: [_jsx("h3", { className: "font-medium mb-1", children: feature.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })] }, feature.title))) })] })] })] }));
}
