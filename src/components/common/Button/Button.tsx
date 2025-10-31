import * as React from "react";
import cn from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: "primary";
  variant?: "contained" | "clean" | "text";
  size?: "base" | "large";
  isDisable?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  onClick,
  className,
  color = "primary",
  variant = "contained",
  size = "base",
  isDisable,
  icon,
  ...rest
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisable}
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
          "px-3 xl:px-4.5 py-1 xl:py-2 h-8 xl:h-10":
            variant === "contained" && size === "base",
        },
        {
          "px-10 py-4 h-10 md:h-14":
            variant === "contained" && size === "large",
        },
        {
          "uppercase bg-primary text-primary-contrast hover:bg-primary-hover":
            variant === "contained" && color === "primary",
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
