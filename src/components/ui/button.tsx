import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-semibold tracking-[0.01em] transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--olive-ink)] text-white shadow-[0_16px_30px_rgba(51,38,26,0.16)] hover:bg-[#443224]",
        secondary:
          "bg-white/88 text-[color:var(--olive-ink)] ring-1 ring-[rgba(84,60,37,0.12)] hover:bg-white",
        ghost:
          "bg-transparent text-[color:var(--muted-ink)] hover:bg-white/70 hover:text-[color:var(--olive-ink)]",
        soft: "bg-[rgba(156,104,68,0.12)] text-[color:var(--clay)] hover:bg-[rgba(156,104,68,0.18)]",
        admin:
          "bg-amber-300 text-slate-950 shadow-sm hover:bg-amber-200",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-10 px-4 py-2.5 text-sm",
        lg: "h-12 px-6 py-3.5 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
