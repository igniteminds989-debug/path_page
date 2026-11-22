import { useEffect, useRef, useState } from "react";

interface PipWalkerProps {
  pathRef: React.RefObject<SVGPathElement | null>;
  nodeLengths: number[];
  currentIndex: number;
  atBoss: boolean;
  reducedMotion: boolean;
}

interface Pos {
  x: number;
  y: number;
}

export function PipWalker({ pathRef, nodeLengths, currentIndex, atBoss, reducedMotion }: PipWalkerProps) {
  const [pos, setPos] = useState<Pos | null>(null);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [walking, setWalking] = useState(false);
  const prevLenRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const sample = (len: number): Pos | null => {
    const p = pathRef.current;
    if (!p) return null;
    try {
      const total = p.getTotalLength();
      if (!total || !isFinite(total)) return null;
      const pt = p.getPointAtLength(Math.max(0, Math.min(len, total)));
      return { x: pt.x, y: pt.y };
    } catch {
      return null;
    }
  };

  // Instant placement on first mount / reduced motion
  useEffect(() => {
    if (reducedMotion) {
      const targetLen = atBoss
        ? nodeLengths[nodeLengths.length - 1] ?? 0
        : nodeLengths[currentIndex] ?? 0;
      const s = sample(targetLen);
      if (s) {
        setPos(s);
        setWalking(false);
      }
      prevLenRef.current = targetLen;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, currentIndex, atBoss, nodeLengths]);

  // Animated walk when currentIndex changes (non-reduced motion only)
  useEffect(() => {
    if (reducedMotion) return;
    const p = pathRef.current;
    if (!p) return;

    const targetLen = atBoss
      ? nodeLengths[nodeLengths.length - 1] ?? 0
      : nodeLengths[currentIndex] ?? 0;
    const startLen = prevLenRef.current ?? targetLen;

    if (Math.abs(targetLen - startLen) < 0.5) {
      const s = sample(targetLen);
      if (s) setPos(s);
      setWalking(false);
      prevLenRef.current = targetLen;
      return;
    }

    setWalking(true);
    const duration = 1000;
    const startTime = performance.now();
    const direction = targetLen > startLen ? 1 : -1;
    setFacing(direction > 0 ? "right" : "left");

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const len = startLen + (targetLen - startLen) * eased;
      const s = sample(len);
      if (s) setPos(s);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setWalking(false);
        prevLenRef.current = targetLen;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, atBoss, reducedMotion, nodeLengths]);

  if (!pos) return null;

  const img = atBoss ? "/assets/pip-victory.png" : walking ? "/assets/pip-side.png" : "/assets/pip-curious.png";
  const flip = facing === "right" ? -1 : 1;

  return (
    <div
      className="pa-pip"
      style={{
        transform: `translate(-50%, -100%) translate(${pos.x}px, ${pos.y}px)`,
      }}
      aria-hidden="true"
    >
      <div className="pa-pip-flip" style={{ transform: `scaleX(${flip})` }}>
        <img
          src={img}
          alt=""
          draggable={false}
          className={walking ? "pa-pip-walk" : "pa-pip-bob"}
        />
      </div>
    </div>
  );
}
