import { useMemo } from "react";

interface FirefliesProps {
  count?: number;
  reducedMotion: boolean;
}

interface Fly {
  left: number;
  top: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
}

export function Fireflies({ count = 15, reducedMotion }: FirefliesProps) {
  const flies = useMemo<Fly[]>(() => {
    return Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: 40 + Math.random() * 60,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 6,
      drift: 20 + Math.random() * 40,
      size: 2 + Math.random() * 3,
    }));
  }, [count]);

  return (
    <div className="pa-fireflies" aria-hidden="true">
      {flies.map((f, i) => (
        <span
          key={i}
          className="pa-firefly"
          style={
            reducedMotion
              ? { left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size, animation: "none" }
              : {
                  left: `${f.left}%`,
                  top: `${f.top}%`,
                  width: `${f.size}px`,
                  height: `${f.size}px`,
                  animationDelay: `${f.delay}s`,
                  animationDuration: `${f.duration}s`,
                  ["--pa-drift" as string]: `${f.drift}px`,
                }
          }
        />
      ))}
    </div>
  );
}
