import { useEffect, useRef } from "react";
import { useGameStore } from "@utils/store.ts";
import cn from "classnames";

export function History({ className }: { className?: string }) {
  const history = useGameStore((s) => s.history);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [history]);

  return (
    <div className={cn("border-stroke border p-0.5 sm:p-1", className)}>
      <div
        ref={logRef}
        className="h-10 md:h-20 lg:h-26 overflow-y-auto"
      >
        {history.map((item, index) => (
          <div className="text-tiny md:text-xs xl:text-sm" key={index}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
