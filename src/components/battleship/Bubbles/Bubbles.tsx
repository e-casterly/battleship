import { useEffect, useState } from "react";
import { getRandomIntInclusive } from "@utils/helpers.ts";

type Bubble = {
  id: number;
  left: number;
  size: number;
};

export function Bubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const left = getRandomIntInclusive(5, 95);
      const size = getRandomIntInclusive(5, 30);

      setBubbles((prev) => [...prev, { id, left, size }]);

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
      }, 6000);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {bubbles.map((b) => (
        <span
          key={b.id}
          style={{
            left: `${b.left}vw`,
            width: b.size,
            height: b.size,
            bottom: `-${b.size}px`,
          }}
          className="absolute bg-white rounded-full animate-rise"
        />
      ))}
    </div>
  );
}
