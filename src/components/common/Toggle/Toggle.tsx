import { createContext, type PropsWithChildren, use } from "react";
import cn from "classnames";

type ToggleContext = {
  value: string;
  onChange: (v: string) => void;
};

const ToggleCtx = createContext<ToggleContext | null>(null);

interface ToggleProps extends PropsWithChildren {
  selectedValue: string;
  onChange: (v: string) => void;
  className?: string;
  label?: string;
}

export function Toggle({
  onChange,
  children,
  selectedValue,
  className,
  label,
}: ToggleProps) {
  return (
    <ToggleCtx value={{ value: selectedValue, onChange }}>
      <div className="inline-flex flex-col gap-y-0.5">
        {label && <div className="text-base font-decorative">{label}</div>}
        <div
          className={cn(
            "inline-flex p-0.5 h-8 xl:h-10 border-stroke border bg-tone rounded-sm",
            className,
          )}
          role="group"
        >
          {children}
        </div>
      </div>
    </ToggleCtx>
  );
}

interface ToggleButtonProps extends PropsWithChildren {
  value: string;
}

export function ToggleButton({ children, value }: ToggleButtonProps) {
  const ctx = use(ToggleCtx);
  const selected = ctx?.value === value;
  return (
    <button
      onClick={() => ctx?.onChange(value)}
      tabIndex={0}
      className={cn(
        "[&:not(:last-child)]:-me-px px-2.5 hover:bg-primary text-base font-normal whitespace-nowrap cursor-pointer font-decorative border-2 text-foreground",
        {
          "border-primary": selected,
          "bg-transparent border-transparent": !selected,
        },
      )}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}
