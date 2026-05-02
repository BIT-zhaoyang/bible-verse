import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-full border border-[rgba(84,60,37,0.12)] bg-white/92 px-5 py-2 text-sm text-[color:var(--olive-ink)] shadow-sm outline-none ring-0 transition placeholder:text-[color:rgba(107,90,73,0.62)] focus:bg-white",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
