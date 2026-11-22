import { useEffect, useRef, useState } from "react";
import { Fireflies } from "./Fireflies";

interface ParallaxSceneProps {
  reducedMotion: boolean;
}

export function ParallaxScene({ reducedMotion }: ParallaxSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;
    const handle = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setOffset({ x: nx, y: ny });
    };
    el.addEventListener("pointermove", handle);
    return () => el.removeEventListener("pointermove", handle);
  }, [reducedMotion]);

  const layers = [
    { src: "/assets/bg-far.png", depth: 8 },
    { src: "/assets/bg-keyart.png", depth: 16 },
    { src: "/assets/layer-mid.png", depth: 30 },
    { src: "/assets/layer-front.png", depth: 52 },
  ];

  return (
    <div className="pa-parallax" ref={rootRef} aria-hidden="true">
      {layers.map((l, i) => (
        <div
          key={i}
          className="pa-parallax-layer"
          style={{
            transform: `translate3d(${-offset.x * l.depth}px, ${-offset.y * l.depth}px, 0) scale(1.06)`,
          }}
        >
          <img src={l.src} alt="" draggable={false} />
        </div>
      ))}
      <Fireflies count={15} reducedMotion={reducedMotion} />
      <div className="pa-parallax-vignette" />
    </div>
  );
}
