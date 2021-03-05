import { useEffect, useRef, useMemo } from "react";

type Parameters<T> = T extends (...args: infer T) => any ? T : never;
type ReturnType<T> = T extends (...args: any[]) => infer T ? T : never;

export type Debounced<T extends Function> = T & { cancel: () => void };
export function debounce<T extends Function>(
  callback: T,
  time: number
): Debounced<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = function (...args: Array<any>): any {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      callback(...args);
    }, time);
  } as any;
  debounced.cancel = function () {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };
  return debounced;
}

// useDebouncedEffect(() => console.log(x), 1000, [x])
export function useDebouncedEffect<T extends Function>(
  callback: T,
  time: number,
  deps: React.DependencyList | undefined
) {
  const tRef = useRef<null | NodeJS.Timeout>(null);
  useEffect(
    function () {
      const timer = tRef.current;
      if (timer) {
        clearTimeout(timer);
      }
      console.log("B");
      tRef.current = setTimeout(function () {
        callback();
      }, time);

      // return () => clearTimeout(timer);
      // reset debounce.
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [time, callback, ...(deps || [])]
  );
}

// export function useDebounced<T extends Function>(
//   callback: T,
//   time: number
// ): Debounced<T> {
//   // The callback can change anytime and it won't reset our debounce.
//   // We just call that new function instead.
//   const callbackRef = useRef(callback);
//   useEffect(
//     function () {
//       callbackRef.current = callback;
//     },
//     [callback]
//   );

//   useEffect(() => , [time]);

//   const debounced = useMemo(() => debounce(callback, time), []);
//   return debounced;

//   //
//   // useEffect(() => debounced.reset, [debounced]);
// }
// (window as any).d = debounce;
