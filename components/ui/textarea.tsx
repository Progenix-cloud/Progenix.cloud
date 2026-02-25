import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border border-gray-300 dark:border-gray-700 placeholder:text-muted-foreground focus-visible:border-purple-500 focus-visible:ring-purple-500/20 dark:focus-visible:border-purple-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-gray-900 flex field-sizing-content min-h-16 w-full rounded-lg bg-white dark:text-foreground px-3 py-2 text-base shadow-sm transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
