export function throttleRaf<T extends (...args: never[]) => void>(fn: T): T {
  let ticking = false;
  let lastArgs: Parameters<T>;
  return function (this: never, ...args: Parameters<T>) {
    lastArgs = args;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        fn.apply(this, lastArgs);
      });
    }
  } as T;
}