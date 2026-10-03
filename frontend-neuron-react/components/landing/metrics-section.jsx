"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
const metrics = [
    {
        value: 12847392,
        suffix: "",
        prefix: "",
        label: "Tasks completed today",
        sublabel: "by 23,847 active agents",
    },
    {
        value: 99,
        suffix: ".99%",
        prefix: "",
        label: "Availability",
        sublabel: "across all regions",
    },
    {
        value: 340,
        suffix: "ms",
        prefix: "<",
        label: "Average execution",
        sublabel: "p99 latency",
    },
];
function AnimatedNumber({ end, suffix = "", prefix = "" }) {
    const [count, setCount] = useState(0);
    const [isScrambling, setIsScrambling] = useState(true);
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                const duration = 2500;
                const startTime = performance.now();
                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 4);
                    setCount(Math.floor(eased * end));
                    setIsScrambling(progress < 0.8);
                    if (progress < 1)
                        requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.5 });
        if (ref.current)
            observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, hasAnimated]);
    const displayValue = count.toLocaleString();
    return (_jsxs("div", { ref: ref, className: "inline-flex items-baseline", children: [_jsx("span", { className: "text-muted-foreground mr-1", children: prefix }), _jsx("span", { className: "tabular-nums", children: displayValue.split("").map((char, i) => (_jsx("span", { className: `inline-block transition-all duration-150 ${isScrambling && char !== "," ? "blur-[1px]" : ""}`, children: char }, i))) }), _jsx("span", { className: "text-muted-foreground", children: suffix })] }));
}
function GridBackground() {
    const canvasRef = useRef(null);
    const timeRef = useRef(0);
    const frameRef = useRef(0);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener("resize", resize);
        const render = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            ctx.clearRect(0, 0, width, height);
            const gridSize = 60;
            const time = timeRef.current;
            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    const wave = Math.sin(x * 0.01 + y * 0.01 + time) * 0.5 + 0.5;
                    const size = 1 + wave * 2;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
                    ctx.fill();
                }
            }
            const pulseY = (time * 30) % height;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, pulseY);
            ctx.lineTo(width, pulseY);
            ctx.stroke();
            timeRef.current += 0.02;
            frameRef.current = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(frameRef.current);
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: "absolute inset-0 pointer-events-none", style: { width: "100%", height: "100%" } }));
}
function DotGraph({ color = "white", height = 32, freq1 = 0.35, freq2 = 0.12, freqT = 0.7, speed = 0.025, baseline = 0.3, amplitude = 0.5, }) {
    const canvasRef = useRef(null);
    const frameRef = useRef(0);
    const timeRef = useRef(Math.random() * 100);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = canvas.offsetWidth || 300;
        const H = height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        const render = () => {
            ctx.clearRect(0, 0, W, H);
            const t = timeRef.current;
            const cols = Math.floor(W / 8);
            for (let i = 0; i < cols; i++) {
                const raw = baseline + amplitude * Math.sin(i * freq1 + t) * Math.cos(i * freq2 + t * freqT);
                const v = Math.max(0, Math.min(1, raw));
                const dotY = H - 4 - v * (H - 8);
                const x = i * 8 + 4;
                const alpha = 0.15 + v * 0.55;
                const r = 1.5 + v * 1.2;
                ctx.beginPath();
                ctx.arc(x, dotY, r, 0, Math.PI * 2);
                ctx.fillStyle = color === "green"
                    ? `rgba(236, 168, 214, ${alpha})`
                    : `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
            timeRef.current += speed;
            frameRef.current = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameRef.current);
    }, [color, height, freq1, freq2, freqT, speed, baseline, amplitude]);
    return (_jsx("canvas", { ref: canvasRef, style: { width: "100%", height: `${height}px`, display: "block" } }));
}
export function MetricsSection() {
    const [time, setTime] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting)
                setIsVisible(true);
        }, { threshold: 0.1 });
        if (sectionRef.current)
            observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);
    return (_jsxs("section", { ref: sectionRef, className: "relative py-32 lg:py-40 overflow-hidden", children: [_jsx(GridBackground, {}), _jsxs("div", { className: "relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12", children: [_jsx("div", { className: "grid lg:grid-cols-12 gap-8 mb-20 lg:mb-32", children: _jsxs("div", { className: "lg:col-span-8 lg:col-start-1", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsxs("span", { className: "flex items-center gap-2 px-3 py-1 bg-[#eca8d6]/10 text-[#eca8d6] text-xs font-mono", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[#eca8d6] animate-pulse" }), "LIVE"] }), _jsx("span", { className: "text-sm font-mono text-muted-foreground", children: time ? `${time.toLocaleTimeString("en-GB")} UTC` : "" })] }), _jsxs("h2", { className: `text-6xl md:text-7xl lg:text-[140px] font-display tracking-tight leading-[0.95] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: ["Real-time", _jsx("br", {}), _jsx("span", { className: "text-muted-foreground", children: "agent metrics." })] })] }) }), _jsx("div", { className: `w-full mb-0 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`, children: _jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/real-time-graph-INFmn3u0MlUwvNPynoIhwxtPaPjxM5.png", alt: "", "aria-hidden": "true", className: "w-full h-auto object-cover" }) }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: `lg:col-span-1 bg-foreground/[0.02] border border-foreground/10 p-10 lg:p-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`, children: [_jsx("div", { className: "text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-4 whitespace-nowrap overflow-hidden", children: _jsx(AnimatedNumber, { end: metrics[0].value, suffix: metrics[0].suffix, prefix: metrics[0].prefix }) }), _jsx("div", { className: "mb-6", children: _jsx(DotGraph, { color: "white", height: 36, freq1: 0.28, freq2: 0.09, freqT: 0.5, speed: 0.018, baseline: 0.35, amplitude: 0.55 }) }), _jsx("div", { className: "text-lg text-foreground mb-2", children: metrics[0].label }), _jsx("div", { className: "text-sm text-muted-foreground font-mono", children: metrics[0].sublabel })] }), metrics.slice(1).map((metric, index) => (_jsxs("div", { className: `bg-foreground/[0.02] border border-foreground/10 p-8 flex flex-col items-start justify-between gap-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`, style: { transitionDelay: `${(index + 1) * 100}ms` }, children: [_jsxs("div", { className: "w-full", children: [_jsx("div", { className: "text-sm text-muted-foreground font-mono mb-2", children: metric.sublabel }), _jsx("div", { className: "text-base text-foreground mb-3", children: metric.label }), _jsx(DotGraph, { color: index === 0 ? "green" : "white", height: 24, freq1: index === 0 ? 0.45 : 0.22, freq2: index === 0 ? 0.18 : 0.07, freqT: index === 0 ? 1.1 : 0.4, speed: index === 0 ? 0.032 : 0.015, baseline: index === 0 ? 0.4 : 0.25, amplitude: index === 0 ? 0.45 : 0.6 })] }), _jsx("div", { className: "text-3xl md:text-4xl lg:text-5xl font-display tracking-tight w-full", children: _jsx(AnimatedNumber, { end: metric.value, suffix: metric.suffix, prefix: metric.prefix }) })] }, metric.label)))] }), _jsxs("div", { className: `mt-16 pt-8 border-t border-foreground/10 flex flex-wrap items-center gap-x-12 gap-y-4 text-sm font-mono text-muted-foreground transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`, children: [_jsx("span", { children: "OpenAI GPT-4 Turbo" }), _jsx("span", { children: "Anthropic Claude 3" }), _jsx("span", { children: "Mistral Large" }), _jsx("span", { children: "Llama 3" }), _jsx("span", { className: "text-foreground", children: "+12 more models" })] })] })] }));
}
