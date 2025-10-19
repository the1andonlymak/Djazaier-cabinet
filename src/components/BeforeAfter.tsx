import { useEffect, useRef, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface BeforeAfterProps {
  beforeSrc: string;
  afterSrc: string;
  altBefore: string;
  altAfter: string;
  initial?: number; // 0..100
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export default function BeforeAfter({ beforeSrc, afterSrc, altBefore, altAfter, initial = 50 }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<number>(clamp(initial));
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clamp(((e.clientX - rect.left) / rect.width) * 100);
      setPos(x);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const startDrag = (clientX: number) => {
    if (!containerRef.current) return;
    draggingRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    startDrag(e.clientX);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPos((p) => clamp(p - 2)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setPos((p) => clamp(p + 2)); }
    if (e.key === 'Home') { e.preventDefault(); setPos(0); }
    if (e.key === 'End') { e.preventDefault(); setPos(100); }
  };

  return (
    <div className="relative" ref={containerRef}>
      <AspectRatio ratio={4/3}>
        <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 bg-black/20">
          <img
            src={beforeSrc}
            alt={altBefore}
            loading="lazy"
            decoding="async"
            width={1600}
            height={1200}
            className="absolute inset-0 w-full h-full object-cover select-none"
          />

          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }} aria-hidden="true">
            <img
              src={afterSrc}
              alt=""
              loading="lazy"
              decoding="async"
              width={1600}
              height={1200}
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0" style={{ left: `calc(${pos}% - 1px)`, width: 2 }}>
            <div className="h-full bg-white/70" />
          </div>

          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 focus:outline-none"
            style={{ left: `calc(${pos}% - 12px)` }}
            role="slider"
            aria-label="Comparateur avant/après"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
          >
            <div className="h-10 w-10 rounded-full bg-white text-gray-900 shadow-md border border-white/60 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 6L3 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 6L21 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          <div className="absolute left-3 top-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">Avant</div>
          <div className="absolute right-3 top-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">Après</div>
        </div>
      </AspectRatio>
    </div>
  );
}
