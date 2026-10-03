import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "Figma", mark: "F", x: "22%", y: "24%" },
  { name: "Claude", mark: "✳", x: "78%", y: "24%" },
  { name: "shadcn", mark: "⌘", x: "18%", y: "52%" },
  { name: "React", mark: "◎", x: "82%", y: "52%" },
  { name: "Motion", mark: "M", x: "26%", y: "80%" },
  { name: "Tailwind", mark: "≈", x: "74%", y: "80%" },
];

export function IntegrationCard() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border-white/15 bg-[#080a0f]/85 p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="relative aspect-[1.4/1] min-h-[250px] overflow-hidden border-b border-white/10 sm:min-h-[300px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-white/20"
          viewBox="0 0 500 350"
          preserveAspectRatio="none"
        >
          {integrations.map((integration) => {
            const x = Number.parseFloat(integration.x) * 5;
            const y = Number.parseFloat(integration.y) * 3.5;
            return (
              <line
                key={integration.name}
                x1="250"
                y1="175"
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            );
          })}
        </svg>

        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl border border-white/15 bg-[#10131a]/95 px-2.5 py-2 shadow-lg sm:gap-2.5 sm:px-3 sm:py-2.5"
            style={{ left: integration.x, top: integration.y }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-sm text-white sm:size-8">
              {integration.mark}
            </span>
            <span className="whitespace-nowrap text-[11px] text-white/80 sm:text-xs">
              {integration.name}
            </span>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 z-20 flex size-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-[#11151d] shadow-[0_0_50px_rgba(167,139,250,0.22)] sm:size-28">
          <div className="absolute inset-[-8px] animate-pulse rounded-[22px] border border-violet-300/20" />
          <span className="font-display text-2xl tracking-tight sm:text-3xl">
            N<span className="text-violet-300">.</span>
          </span>
        </div>

        <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:left-6 sm:top-6">
          Connected ecosystem
        </span>
      </div>

      
    </Card>
  );
}
