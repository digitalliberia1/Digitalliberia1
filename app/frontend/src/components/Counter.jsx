import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 → target when the element enters the viewport.
 * Accepts string values like "2.1M", "5M+", "95%", "47" and animates the numeric portion only.
 */
export default function Counter({ value, duration = 1600, className = "", testId }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = String(value).match(/^([0-9]*\.?[0-9]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(match[1]);
    const suffix = match[2] || "";
    const isFloat = match[1].includes(".");

    setDisplay(`0${suffix}`);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              const current = target * eased;
              const formatted = isFloat ? current.toFixed(1) : Math.round(current).toString();
              setDisplay(`${formatted}${suffix}`);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className} data-testid={testId}>
      {display}
    </span>
  );
}
