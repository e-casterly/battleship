export function AxisY({ cols }: { cols: number }) {
  return (
    <div className="flex col-span-full h-4 lg:h-5 ms-3 lg:ms-4">
      {Array.from({ length: cols }).map((_, index) => (
        <div
          key={index}
          className="w-full text-center text-tiny lg:text-sm leading-none"
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
}
