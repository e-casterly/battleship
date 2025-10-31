import { useMemo } from "react";

export function AxisX({ rows }: { rows: number }) {
  const boardLetters = useMemo(() => {
    return Array.from({ length: rows }, (_, i) =>
      String.fromCharCode("A".charCodeAt(0) + i),
    );
  }, [rows]);

  return (
    <div className="flex flex-col w-3 lg:w-4 h-full">
      {boardLetters.map((value) => (
        <div
          key={value}
          className="w-full flex-1 text-center text-tiny lg:text-sm leading-none flex items-center justify-start"
        >
          {value}
        </div>
      ))}
    </div>
  );
}
