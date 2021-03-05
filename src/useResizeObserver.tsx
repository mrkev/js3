import { useState, useEffect } from "react";

export function useResizeObserver(
  element: Element | null
): DOMRectReadOnly | null {
  const [contentRect, setContentRect] = useState<DOMRectReadOnly | null>(null);
  useEffect(() => {
    if (!element) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target !== element) {
          continue;
        }
        setContentRect(entry.contentRect);
        return;
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [element]);

  return contentRect;
}
