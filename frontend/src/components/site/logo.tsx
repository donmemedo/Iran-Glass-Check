import { cn } from "@/lib/utils";

/** A windscreen silhouette with the check cut through it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="glasscheck-mark" x1="4" y1="4" x2="28" y2="28">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <path
        d="M6.4 22.6 9.1 9.9a3 3 0 0 1 2.6-2.35 42 42 0 0 1 8.6 0 3 3 0 0 1 2.6 2.35l2.7 12.7a2 2 0 0 1-1.65 2.4 62 62 0 0 1-16.3 0 2 2 0 0 1-1.65-2.4Z"
        stroke="url(#glasscheck-mark)"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="m11.6 16.9 3.05 3.1 6.05-7.2"
        stroke="url(#glasscheck-mark)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
