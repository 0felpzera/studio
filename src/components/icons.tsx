import { cn } from "@/lib/utils";

export function TrendifyLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
      {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12 12 8 16 12" />
        <line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  );
}
