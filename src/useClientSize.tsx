import { useEffect, useState } from "react";

export default function useClientSize(): [number, number] {
  const [dims, setDims] = useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  useEffect(() => {
    const resizeHandler = function () {
      setDims([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return dims;
}
