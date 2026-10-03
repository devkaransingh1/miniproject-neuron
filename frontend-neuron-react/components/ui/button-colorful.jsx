import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonColorful({
  className,
  label = "Explore Components",
  ...props
}) {
  return (
    <Button
      className={cn(
        "group relative h- overflow-hidden rounded-full bg-zinc-900 px-15 transition-all duration-200 hover:bg-zinc-900",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-55 blur transition-opacity duration-500 group-hover:opacity-90"
      />
      <span className="relative flex items-center justify-center gap-2">
        <span className="text-white">{label}</span>
        <svg
          aria-label="Google"
          role="img"
          className="size-4"
          viewBox="0 0 48 48"
        >
          <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
          />
          <path
            fill="#EA4335"
            d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
          />
        </svg>
      </span>
    </Button>
  );
}
