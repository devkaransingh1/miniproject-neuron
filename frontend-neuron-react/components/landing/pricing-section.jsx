"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
const plans = [
    {
        name: "Explorer",
        description: "For tinkering and small automations",
        price: { monthly: 0, annual: 0 },
        features: [
            "3 concurrent agents",
            "1,000 tasks/month",
            "Community support",
            "Basic logging",
            "Public integrations",
        ],
        cta: "Start free",
        highlight: false,
    },
    {
        name: "Builder",
        description: "For teams shipping with agents",
        price: { monthly: 79, annual: 65 },
        features: [
            "25 concurrent agents",
            "50,000 tasks/month",
            "Priority support",
            "Full audit trails",
            "Private integrations",
            "Team workspaces",
            "Custom agent roles",
        ],
        cta: "Start trial",
        highlight: true,
    },
    {
        name: "Scale",
        description: "For agent-first organizations",
        price: { monthly: null, annual: null },
        features: [
            "Unlimited agents",
            "Unlimited tasks",
            "24/7 dedicated support",
            "On-premise deployment",
            "SLA guarantee",
            "Custom LLM routing",
            "Advanced security",
            "Dedicated compute",
        ],
        cta: "Contact sales",
        highlight: false,
    },
];
export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true);
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
    return (_jsxs("section", { id: "pricing", ref: sectionRef, className: "relative py-32 lg:py-40", children: [_jsxs("div", { className: "max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsxs("div", { className: "grid lg:grid-cols-12 gap-8 mb-20", children: [_jsxs("div", { className: "lg:col-span-7", children: [_jsxs("span", { className: "inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8", children: [_jsx("span", { className: "w-12 h-px bg-foreground/30" }), "Pricing"] }), _jsxs("h2", { className: `text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: ["Pay for", _jsx("br", {}), _jsx("span", { className: "text-stroke", children: "results." })] })] }), _jsx("div", { className: "lg:col-span-5 relative p-0 h-96 lg:h-auto", children: _jsx("div", { className: `absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`, children: _jsx("img", { src: "/images/whale.png", alt: "Organic whale", className: "w-full h-full object-contain object-center" }) }) })] }), _jsx("div", { className: "relative", children: _jsx("div", { className: "grid lg:grid-cols-3 gap-4 lg:gap-0", children: plans.map((plan, index) => (_jsxs("div", { className: `relative bg-background border transition-all duration-700 ${plan.highlight
                                    ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105"
                                    : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`, style: { transitionDelay: `${index * 100}ms` }, children: [plan.highlight && (_jsx("div", { className: "absolute -top-4 left-8 right-8 flex justify-center", children: _jsxs("span", { className: "inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest", children: [_jsx(Zap, { className: "w-3 h-3" }), "Most Popular"] }) })), _jsxs("div", { className: "p-8 lg:p-10", children: [_jsxs("div", { className: "mb-8 pb-8 border-b border-foreground/10", children: [_jsx("span", { className: "font-mono text-xs text-muted-foreground", children: String(index + 1).padStart(2, "0") }), _jsx("h3", { className: "text-2xl lg:text-3xl font-display mt-2", children: plan.name }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: plan.description })] }), _jsxs("div", { className: "mb-8", children: [plan.price.monthly !== null ? (_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsxs("span", { className: "text-5xl lg:text-6xl font-display", children: ["$", isAnnual ? plan.price.annual : plan.price.monthly] }), _jsx("span", { className: "text-muted-foreground text-sm", children: "/month" })] })) : (_jsx("span", { className: "text-4xl font-display", children: "Custom" })), plan.price.monthly !== null && plan.price.monthly > 0 && (_jsx("p", { className: "text-xs text-muted-foreground mt-2 font-mono", children: isAnnual ? "billed annually" : "billed monthly" }))] }), _jsx("ul", { className: "space-y-3 mb-10", children: plan.features.map((feature) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(Check, { className: "w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" }), _jsx("span", { className: "text-sm text-muted-foreground", children: feature })] }, feature))) }), _jsxs("button", { className: `w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${plan.highlight
                                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"}`, children: [plan.cta, _jsx(ArrowRight, { className: "w-4 h-4 transition-transform group-hover:translate-x-1" })] })] })] }, plan.name))) }) }), _jsxs("div", { className: `mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`, children: [_jsxs("div", { className: "flex flex-wrap gap-6 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-[#eca8d6]" }), "Encrypted execution"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-[#eca8d6]" }), "Full audit logs"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-[#eca8d6]" }), "Multi-model routing"] })] }), _jsx("a", { href: "#", className: "text-sm underline underline-offset-4 hover:text-foreground transition-colors", children: "Compare all features" })] })] }), _jsx("style", { children: `
        .text-stroke {
          -webkit-text-stroke: 1.5px currentColor;
          -webkit-text-fill-color: transparent;
        }
      ` })] }));
}
