"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
const testimonials = [
    {
        quote: "Our agents handle 80% of our customer support tickets autonomously. The ROI was immediate.",
        author: "Sarah Chen",
        role: "CTO",
        company: "Meridian Labs",
        metric: { value: "80%", label: "Ticket resolution" },
    },
    {
        quote: "We deployed research agents that work 24/7. They surface insights we'd never find manually.",
        author: "Marcus Webb",
        role: "Head of Research",
        company: "Flux Systems",
        metric: { value: "10x", label: "Research output" },
    },
    {
        quote: "The multi-agent orchestration is incredible. Complex workflows that took weeks now run in hours.",
        author: "Elena Rodriguez",
        role: "VP Engineering",
        company: "Beacon AI",
        metric: { value: "40x", label: "Faster workflows" },
    },
    {
        quote: "Security was our biggest concern. The sandboxing and audit trails gave us full confidence.",
        author: "James Liu",
        role: "CISO",
        company: "Prism Analytics",
        metric: { value: "0", label: "Security incidents" },
    },
];
export function TestimonialsSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [direction, setDirection] = useState("right");
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
            setDirection("right");
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);
    const goTo = (index) => {
        setDirection(index > activeIndex ? "right" : "left");
        setActiveIndex(index);
    };
    const goPrev = () => {
        setDirection("left");
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };
    const goNext = () => {
        setDirection("right");
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };
    const activeTestimonial = testimonials[activeIndex];
    return (_jsxs("section", { ref: sectionRef, className: "relative py-32 lg:py-40 bg-foreground text-background overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 font-mono text-[10px] text-background/[0.02] leading-tight overflow-hidden whitespace-pre select-none", children: Array.from({ length: 60 }, (_, i) => Array.from({ length: 100 }, () => Math.random() > 0.7 ? '"' : ' ').join("")).join("\n") }), _jsxs("div", { className: "relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsxs("div", { className: "flex items-center justify-between mb-20", children: [_jsxs("div", { children: [_jsxs("span", { className: "inline-flex items-center gap-3 text-sm font-mono text-background/40 mb-4", children: [_jsx("span", { className: "w-12 h-px bg-background/20" }), "Testimonials"] }), _jsxs("h2", { className: `text-4xl lg:text-5xl font-display transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, children: ["Trusted by teams", _jsx("span", { className: "text-background/40", children: " worldwide." })] })] }), _jsxs("div", { className: "hidden lg:flex items-center gap-2", children: [_jsx("button", { onClick: goPrev, className: "p-4 border border-background/20 hover:bg-background/10 transition-colors", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsx("button", { onClick: goNext, className: "p-4 border border-background/20 hover:bg-background/10 transition-colors", children: _jsx(ArrowRight, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-12 lg:gap-20", children: [_jsxs("div", { className: "lg:col-span-7 relative", children: [_jsx("span", { className: "absolute -left-4 -top-8 text-[200px] font-display text-background/5 leading-none select-none", children: "\u201C" }), _jsxs("div", { className: "relative", children: [_jsx("blockquote", { className: "text-3xl lg:text-4xl xl:text-5xl font-display leading-[1.2] tracking-tight animate-fadeSlideIn", children: activeTestimonial.quote }, activeIndex), _jsxs("div", { className: "mt-12 flex items-center gap-6", children: [_jsx("div", { className: "w-14 h-14 rounded-full bg-background/10 flex items-center justify-center", children: _jsx("span", { className: "font-display text-xl", children: activeTestimonial.author.charAt(0) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-medium", children: activeTestimonial.author }), _jsxs("p", { className: "text-background/60", children: [activeTestimonial.role, ", ", activeTestimonial.company] })] })] })] })] }), _jsxs("div", { className: "lg:col-span-5 flex flex-col justify-center gap-6", children: [_jsxs("div", { className: "p-10 border border-background/20 bg-background/5 animate-fadeSlideIn", children: [_jsx("span", { className: "text-7xl lg:text-8xl font-display block mb-4", children: activeTestimonial.metric.value }), _jsx("span", { className: "text-lg text-background/60", children: activeTestimonial.metric.label })] }, `metric-${activeIndex}`), _jsx("div", { className: "flex gap-2", children: testimonials.map((_, idx) => (_jsx("button", { onClick: () => goTo(idx), className: "flex-1 h-1 bg-background/20 overflow-hidden", children: _jsx("div", { className: `h-full bg-background transition-all duration-300 ${idx === activeIndex ? "w-full" : idx < activeIndex ? "w-full opacity-50" : "w-0"}`, style: idx === activeIndex ? { animation: "progress 8s linear forwards" } : {} }) }, idx))) }), _jsxs("div", { className: "mt-4 pt-6 border-t border-background/10", children: [_jsx("span", { className: "text-xs font-mono text-background/30 uppercase tracking-widest block mb-4", children: "Featured companies" }), _jsx("div", { className: "flex flex-wrap gap-3", children: testimonials.map((t, idx) => (_jsx("button", { onClick: () => goTo(idx), className: `px-4 py-2 text-sm border transition-all ${idx === activeIndex
                                                        ? "border-background/40 text-background"
                                                        : "border-background/10 text-background/40 hover:border-background/30"}`, children: t.company }, t.company))) })] })] })] })] }), _jsx("style", { children: `
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.5s ease-out forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      ` })] }));
}
