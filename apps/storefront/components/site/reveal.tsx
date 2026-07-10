'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll-reveal wrapper: fades and lifts its children into view the first time
 * they enter the viewport (via IntersectionObserver). Purely decorative and
 * deliberately unconditional — matching the storefront's mandala motion — so the
 * animation is always seen. Pass `delay` (ms) to stagger siblings.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        'transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
