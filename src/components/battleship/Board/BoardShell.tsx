import cn from "clsx";
import { AxisY } from "@components/battleship/Board/AxisY.tsx";
import { AxisX } from "@components/battleship/Board/AxisX.tsx";
import type { ReactNode } from "react";

interface BoardShellProps {
  rows: number;
  cols: number;
  isFocused?: boolean;
  label?: string;
  children: ReactNode;
}

export function BoardShell({ rows, cols, isFocused, label, children }: BoardShellProps) {
  return (
    <div className="inline-grid grid-cols-[auto_1fr] items-center justify-center">
      <AxisY cols={cols} />
      <AxisX rows={rows} />
      <div
        className={cn(
          "grid w-full border border-stroke justify-center items-center",
          { "shadow-base": isFocused },
        )}
        style={{
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}
