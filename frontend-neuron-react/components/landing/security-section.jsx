"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";
const securityFeatures = [
    {
        icon: Shield,
        title: "Isolated execution",
        description: "Each agent runs in its own secure sandbox.",
        image: "/images/isolated.jpg",
    },
    {
        icon: Lock,
        title: "Encrypted memory",
        description: "Data encrypted at rest and in transit.",
        image: "/images/encrypted.jpg",
    },
    {
        icon: Eye,
        title: "Full audit trails",
        description: "Every action logged and inspectable.",
        image: "/images/audit.jpg",
    },
    {
        icon: FileCheck,
        title: "Permission boundaries",
        description: "Principle of least privilege by design.",
        image: "/images/permissions.jpg",
    },
];
const certifications = ["SOC 2", "ISO 27001", "HIPAA", "GDPR"];
export function SecuritySection() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
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
            setActiveFeature((prev) => (prev + 1) % securityFeatures.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (_jsx("section", { id: "security", ref: sectionRef, className: "relative py-32 lg:py-40 overflow-hidden", children: _jsxs("div", { className: "max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsxs("div", { className: "mb-20", children: [_jsxs("span", { className: `inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`, children: [_jsx("span", { className: "w-12 h-px bg-foreground/20" }), "Security"] }), _jsxs("h2", { className: `text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: ["Autonomous,", _jsx("br", {}), _jsx("span", { className: "text-muted-foreground", children: "not uncontrolled." })] }), _jsx("div", { className: `transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`, children: _jsx("p", { className: "text-xl text-muted-foreground leading-relaxed max-w-2xl", children: "Your agents are powerful but constrained. Enterprise-grade security ensures they only do what you allow." }) })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: `lg:col-span-7 relative p-8 lg:p-12 border border-foreground/10 min-h-[400px] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [_jsx("div", { className: "absolute inset-0 pointer-events-none items-center justify-end hidden lg:flex", children: securityFeatures.map((feature, index) => (_jsx("img", { src: feature.image, alt: feature.title, className: "absolute h-3/4 w-3/4 object-contain object-right transition-opacity duration-500", style: { opacity: activeFeature === index ? 0.85 : 0 } }, feature.image))) }), _jsxs("div", { className: "relative z-10", children: [_jsx("span", { className: "font-mono text-sm text-muted-foreground", children: "Active protection" }), _jsxs("div", { className: "mt-8", children: [_jsx("span", { className: "text-7xl lg:text-8xl font-display", children: "0" }), _jsx("span", { className: "block text-muted-foreground mt-2", children: "Security incidents this year" })] })] }), _jsx("div", { className: "absolute bottom-8 left-8 right-8 flex flex-wrap gap-2", children: certifications.map((cert, index) => (_jsx("span", { className: `px-3 py-1 border border-foreground/10 text-xs font-mono text-muted-foreground transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, style: { transitionDelay: `${index * 100 + 300}ms` }, children: cert }, cert))) })] }), _jsx("div", { className: "lg:col-span-5 flex flex-col gap-4", children: securityFeatures.map((feature, index) => (_jsx("div", { className: `p-6 border transition-all duration-500 cursor-default ${activeFeature === index
                                    ? "border-foreground/30 bg-foreground/[0.04]"
                                    : "border-foreground/10"} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`, style: { transitionDelay: `${index * 80}ms` }, onClick: () => setActiveFeature(index), onMouseEnter: () => setActiveFeature(index), children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `shrink-0 w-10 h-10 flex items-center justify-center border transition-colors ${activeFeature === index
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-foreground/20"}`, children: _jsx(feature.icon, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: feature.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })] })] }) }, feature.title))) })] })] }) }));
}
