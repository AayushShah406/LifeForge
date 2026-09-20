import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#07060B] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    const variants = {
      primary: "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold shadow-[0_0_18px_rgba(139,92,246,0.35)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] focus:ring-[#8B5CF6] border border-[#A78BFA]/30",
      glow: "bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] focus:ring-[#8B5CF6] border border-[#C4B5FD]/40",
      secondary: "bg-[#181421] hover:bg-[#201A2D] text-[#F5F3FF] border border-[rgba(139,92,246,0.25)] focus:ring-[#8B5CF6]",
      outline: "border border-[rgba(139,92,246,0.3)] hover:border-[#8B5CF6] bg-transparent text-[#DDD6FE] hover:text-[#F5F3FF] hover:bg-[rgba(139,92,246,0.1)] focus:ring-[#8B5CF6]",
      ghost: "bg-transparent hover:bg-[rgba(139,92,246,0.08)] text-[#8C82A2] hover:text-[#F5F3FF] focus:ring-[#8B5CF6]",
      danger: "bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] text-[#F87171] border border-[rgba(239,68,68,0.35)] focus:ring-[#EF4444]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
