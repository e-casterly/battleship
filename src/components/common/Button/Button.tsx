import cn from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "contained" | "clean" | "text";
  size?: "base" | "large";
  icon?: ReactNode;
}

export default function Button({
  children,
  variant = "contained",
  size = "base",
  icon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex gap-x-0.5 items-center justify-center whitespace-nowrap",
        "font-decorative",
        "cursor-pointer disabled:pointer-events-none focus-visible:outline-none",
        "disabled:cursor-default disabled:opacity-50",
        { "text-foreground hover:text-primary": variant === "text" },
        { "text-base font-normal": size === "base" && variant === "text" },
        {
          "text-xs xl:text-sm 2xl:text-base font-normal":
            size === "base" && variant === "contained",
        },
        {
          "px-2 md:px-3 xl:px-4.5 py-1 xl:py-2 h-8 xl:h-10":
            variant === "contained" && size === "base",
        },
        {
          "px-10 py-4 h-10 md:h-14":
            variant === "contained" && size === "large",
        },
        {
          "uppercase bg-primary text-primary-contrast hover:bg-primary-hover":
            variant === "contained",
        },
        { "bg-transparent hover:text-primary-hover": variant === "clean" },
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
