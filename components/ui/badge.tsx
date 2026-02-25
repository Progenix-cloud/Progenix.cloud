import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 [a&]:hover:bg-purple-200 dark:hover:bg-purple-900/60",
        secondary:
          "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 [a&]:hover:bg-gray-200 dark:hover:bg-gray-700",
        destructive:
          "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 [a&]:hover:bg-red-200 dark:hover:bg-red-900/60",
        outline:
          "border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 [a&]:hover:bg-gray-100 dark:hover:bg-gray-800",
        success:
          "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 [a&]:hover:bg-green-200 dark:hover:bg-green-900/60",
        warning:
          "border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 [a&]:hover:bg-amber-200 dark:hover:bg-amber-900/60",
        info: "border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 [a&]:hover:bg-blue-200 dark:hover:bg-blue-900/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(({ className, variant, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="badge"
    className={cn(badgeVariants({ variant }), className)}
    {...props}
  />
));

Badge.displayName = "Badge";

export { Badge, badgeVariants };
