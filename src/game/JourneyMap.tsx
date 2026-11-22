import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Lock, Check } from "lucide-react";
import type { Lesson, Topic } from "./data/lessons";
import { Badge } from "./Badges";
import { PipWalker } from "./PipWalker";

export type NodeState = "locked" | "current" | "completed";

interface JourneyMapProps {
  lesson: Lesson;
  completedTopics: string[];
  currentIndex: number;
  bossUnlocked: boolean;
  onOpenTopic: (topicId: string) => void;
  onOpenBoss: () => void;
  reducedMotion: boolean;
}

interface NodePos {
  x: number;
  y: number;
  length: number;
}

export function JourneyMap({
  lesson,
  completedTopics,
  currentIndex,
  bossUnlocked,
  onOpenTopic,
  onOpenBoss,
  reducedMotion,
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePos[]>([]);
  const [nodeLengths, setNodeLengths] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build path string for current size + compute node positions via getPointAtLength
  const pathD = useMemo(() => buildPath(size.w, size.h), [size]);

  useEffect(() => {
    const p = pathRef.current;
    if (!p || size.w === 0 || !pathD) return;
    p.setAttribute("d", pathD);
    let total: number;
    try {
      total = p.getTotalLength();
    } catch {
      return;
    }
    if (!total || !isFinite(total)) return;
    const topicCount = lesson.topics.length;
    const segments = topicCount + 1; // last segment ends at boss
    const positions: NodePos[] = [];
    const lengths: number[] = [];
    for (let i = 0; i < topicCount; i++) {
      const len = (total * i) / segments;
      try {
        const pt = p.getPointAtLength(len);
        positions.push({ x: pt.x, y: pt.y, length: len });
        lengths.push(len);
      } catch {
        // ignore
      }
    }
    const bossLen = total;
    try {
      const bossPt = p.getPointAtLength(bossLen);
      positions.push({ x: bossPt.x, y: bossPt.y, length: bossLen });
      lengths.push(bossLen);
    } catch {
      // ignore
    }
    setNodePositions(positions);
    setNodeLengths(lengths);
  }, [pathD, size, lesson.topics.length]);

  const stateFor = (topic: Topic, index: number): NodeState => {
    if (completedTopics.includes(topic.id)) return "completed";
    if (index === currentIndex) return "current";
    return "locked";
  };

  const handleNodeClick = (topic: Topic, state: NodeState) => {
    if (state === "locked") {
      setShakeId(topic.id);
      setTimeout(() => setShakeId((id) => (id === topic.id ? null : id)), 500);
      return;
    }
    onOpenTopic(topic.id);
  };

  const atBoss = bossUnlocked && completedTopics.length === lesson.topics.length;

  return (
    <div className="pa-map" ref={containerRef}>
      <svg className="pa-trail-svg" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
        <path ref={pathRef} className="pa-trail-shadow" d={pathD} fill="none" />
        <path className="pa-trail-main" d={pathD} fill="none" />
        <path className="pa-trail-dash" d={pathD} fill="none" />
      </svg>

      {nodePositions.slice(0, lesson.topics.length).map((np, i) => {
        const topic = lesson.topics[i];
        const state = stateFor(topic, i);
        return (
          <MapNode
            key={topic.id}
            topic={topic}
            index={i}
            state={state}
            x={np.x}
            y={np.y}
            shaking={shakeId === topic.id}
            onClick={() => handleNodeClick(topic, state)}
          />
        );
      })}

      {nodePositions.length > lesson.topics.length && (
        <BossNode
          x={nodePositions[nodePositions.length - 1].x}
          y={nodePositions[nodePositions.length - 1].y}
          unlocked={bossUnlocked}
          bossName={lesson.bossName}
          shaking={shakeId === "__boss__"}
          onClick={() => {
            if (!bossUnlocked) {
              setShakeId("__boss__");
              setTimeout(() => setShakeId((id) => (id === "__boss__" ? null : id)), 500);
              return;
            }
            onOpenBoss();
          }}
        />
      )}

      <PipWalker
        pathRef={pathRef}
        nodeLengths={nodeLengths}
        currentIndex={currentIndex}
        atBoss={atBoss}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

interface MapNodeProps {
  topic: Topic;
  index: number;
  state: NodeState;
  x: number;
  y: number;
  shaking: boolean;
  onClick: () => void;
}

function MapNode({ topic, index, state, x, y, shaking, onClick }: MapNodeProps) {
  const label = `Topic ${index + 1}: ${topic.title}, ${state}`;
  const disabled = state === "locked";
  return (
    <button
      type="button"
      className={`pa-node pa-node-${state}${shaking ? " pa-shake" : ""}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
    >
      <span className="pa-node-inner">
        {state === "completed" ? (
          <Badge id={topic.badgeImage} size={54} className="pa-node-badge" />
        ) : state === "current" ? (
          <span className="pa-node-num">{index + 1}</span>
        ) : (
          <span className="pa-node-num">{index + 1}</span>
        )}
        {state === "completed" && (
          <span className="pa-node-check">
            <Check size={14} strokeWidth={3.5} />
          </span>
        )}
        {state === "locked" && (
          <span className="pa-node-lock">
            <Lock size={18} strokeWidth={2.5} />
          </span>
        )}
      </span>
      <span className="pa-node-label">{index + 1}</span>
    </button>
  );
}

interface BossNodeProps {
  x: number;
  y: number;
  unlocked: boolean;
  bossName: string;
  shaking: boolean;
  onClick: () => void;
}

function BossNode({ x, y, unlocked, bossName, shaking, onClick }: BossNodeProps) {
  return (
    <button
      type="button"
      className={`pa-boss-node${unlocked ? " pa-boss-unlocked" : ""}${shaking ? " pa-shake" : ""}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClick}
      disabled={!unlocked}
      aria-label={`Boss: ${bossName}, ${unlocked ? "ready" : "locked"}`}
      tabIndex={unlocked ? 0 : -1}
    >
      <span className="pa-boss-temple">
        {unlocked ? (
          <span className="pa-boss-eye" />
        ) : (
          <span className="pa-boss-lock">
            <Lock size={26} strokeWidth={2.5} />
          </span>
        )}
      </span>
      <span className="pa-boss-label">{bossName}</span>
    </button>
  );
}

function buildPath(w: number, h: number): string {
  if (w === 0 || h === 0) return "";
  const isMobile = w < 600;
  const padX = isMobile ? w * 0.14 : w * 0.1;
  const padBottom = h * 0.08;
  const padTop = h * 0.1;
  const usableW = w - padX * 2;
  const usableH = h - padBottom - padTop;

  const startX = padX;
  const startY = h - padBottom;
  const endX = w - padX;
  const endY = padTop;

  const segments = 4; // S-zigzag count
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = startY - usableH * t;
    const xBase = startX + usableW * t;
    const side = i % 2 === 0 ? -1 : 1;
    const wobble = isMobile ? usableW * 0.22 : usableW * 0.16;
    const x = i === 0 ? startX : i === segments ? endX : xBase + side * wobble * 0.5;
    points.push({ x, y });
  }

  // Build smooth cubic path
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
  }
  return d;
}
