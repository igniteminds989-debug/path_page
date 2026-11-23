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

interface PathPoint {
  x: number;
  y: number;
}

const mapPoints: PathPoint[] = [
  { x: 20, y: 90 },
  { x: 45, y: 82 },
  { x: 72, y: 70 },
  { x: 50, y: 56 },
  { x: 26, y: 44 },
  { x: 52, y: 22 },
];

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
  const [pathTotal, setPathTotal] = useState(0);

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

  const visualPath = useMemo(() => buildCurve(mapPoints), []);
  const samplingPath = useMemo(
    () => buildCurve(mapPoints.map((point) => ({ x: point.x * size.w / 100, y: point.y * size.h / 100 }))),
    [size]
  );

  useEffect(() => {
    const p = pathRef.current;
    if (!p || size.w === 0 || !samplingPath) return;
    p.setAttribute("d", samplingPath);
    try {
      const total = p.getTotalLength();
      const lengths = mapPoints.map((_, index) => p.getTotalLength() * index / (mapPoints.length - 1));
      const positions = mapPoints.map((point, index) => ({ ...point, length: lengths[index] }));
      setPathTotal(total);
      setNodePositions(positions);
      setNodeLengths(lengths);
    } catch {
      setNodePositions([]);
      setNodeLengths([]);
      setPathTotal(0);
    }
  }, [samplingPath, size]);

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
  const completedRatio = pathTotal > 0
    ? (nodeLengths[Math.min(completedTopics.length, lesson.topics.length)] ?? 0) / pathTotal
    : 0;

  return (
    <div className={`pa-map${atBoss ? " pa-map-boss-ready" : ""}`} ref={containerRef}>
      <svg className="pa-trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="pa-trail-shadow" d={visualPath} pathLength="1" fill="none" />
        <path className="pa-trail-main" d={visualPath} pathLength="1" fill="none" />
        <path className="pa-trail-complete" d={visualPath} pathLength="1" strokeDasharray={`${completedRatio} 1`} fill="none" />
      </svg>
      <svg className="pa-trail-sampler" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} d={samplingPath} fill="none" />
      </svg>

      {nodePositions.slice(1, lesson.topics.length + 1).map((np, i) => {
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

      {nodePositions.length === mapPoints.length && (
        <BossNode
          x={nodePositions[mapPoints.length - 1].x}
          y={nodePositions[mapPoints.length - 1].y}
          unlocked={bossUnlocked}
          bossName={lesson.bossName}
          completedTopics={completedTopics}
          lesson={lesson}
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
        currentIndex={currentIndex + 1}
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
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
    >
      <span className="pa-node-inner">
        <Badge id={topic.badgeImage} size={76} className="pa-node-badge" />
        <span className="pa-node-num">{index + 1}</span>
        {state === "completed" && <span className="pa-node-check"><Check size={14} strokeWidth={3.5} /></span>}
        {state === "locked" && <span className="pa-node-lock"><Lock size={16} strokeWidth={2.5} /></span>}
      </span>
    </button>
  );
}

interface BossNodeProps {
  x: number;
  y: number;
  unlocked: boolean;
  bossName: string;
  completedTopics: string[];
  lesson: Lesson;
  shaking: boolean;
  onClick: () => void;
}

function BossNode({ x, y, unlocked, bossName, completedTopics, lesson, shaking, onClick }: BossNodeProps) {
  return (
    <button
      type="button"
      className={`pa-boss-node${unlocked ? " pa-boss-unlocked" : ""}${shaking ? " pa-shake" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      disabled={!unlocked}
      aria-label={`Boss: ${bossName}, ${unlocked ? "ready" : "locked"}`}
      tabIndex={unlocked ? 0 : -1}
    >
      <span className="pa-boss-medallion">
        <img src="/assets/medallion-gloom-slug.png.png" alt="" draggable={false} />
        {!unlocked && <span className="pa-boss-lock"><Lock size={24} strokeWidth={2.5} /></span>}
      </span>
      {unlocked && <span className="pa-boss-fight">Fight!</span>}
      <span className="pa-boss-label">{bossName}</span>
      <span className="pa-boss-slots" aria-label={`${completedTopics.length} of ${lesson.topics.length} power stones collected`}>
        {lesson.topics.map((topic) => (
          <Badge key={topic.id} id={topic.badgeImage} size={18} className={completedTopics.includes(topic.id) ? "pa-slot-filled" : "pa-slot-empty"} />
        ))}
      </span>
    </button>
  );
}

function buildCurve(points: PathPoint[]): string {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const controlY = (previous.y + current.y) / 2;
    d += ` C ${previous.x} ${controlY}, ${current.x} ${controlY}, ${current.x} ${current.y}`;
  }
  return d;
}
