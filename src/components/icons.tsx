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
      <path d="M2.5 14.5A2.5 2.5 0 0 1 5 12h14a2.5 2.5 0 0 1 2.5 2.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M6.5 12V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v8" />
    </svg>
  );
}
