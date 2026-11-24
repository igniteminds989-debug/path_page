import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import type { Lesson, Topic } from "./data/lessons";
import type { Zone } from "./data/zones";
import { Badge } from "./Badges";
import { buildMapLayout, type MapLayout, type MapNode } from "./mapLayout";

export type NodeState = "locked" | "current" | "completed";

type VisualNodeState = NodeState | "coming";

interface JourneyMapProps {
  lessons: Lesson[];
  zones: Zone[];
  completedTopics: string[];
  currentIndex: number;
  bossUnlocked: boolean;
  onOpenTopic: (topicId: string) => void;
  onOpenBoss: () => void;
  reducedMotion: boolean;
}

export function JourneyMap({ lessons, zones, completedTopics, currentIndex, bossUnlocked, onOpenTopic, onOpenBoss, reducedMotion }: JourneyMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [activeZoneId, setActiveZoneId] = useState(1);
  const [didPosition, setDidPosition] = useState(false);
  const layout = useMemo(() => buildMapLayout(lessons, zones, width), [lessons, zones, width]);
  const currentTopicId = lessons[0]?.topics[currentIndex]?.id;
  const currentNode = layout.nodes.find((node) => node.topicId === currentTopicId) ?? layout.nodes[0];
  const completedCount = lessons[0]?.topics.filter((topic) => completedTopics.includes(topic.id)).length ?? 0;
  const completedRatio = layout.nodes.length ? Math.min(1, (completedCount + 1) / layout.nodes.length) : 0;
  const frontImage = activeZoneId === 5 ? "/assets/zones/front-crags-zone-5.webp" : "/assets/zones/front-foliage.webp";

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !layout.totalHeight || !currentNode) return;
    setDidPosition(false);
    viewport.scrollTop = Math.max(0, layout.totalHeight - viewport.clientHeight);
    const frame = requestAnimationFrame(() => {
      const target = currentNode.y - viewport.clientHeight * 0.62;
      viewport.scrollTop = Math.max(0, Math.min(layout.totalHeight - viewport.clientHeight, target));
      setDidPosition(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [layout, currentTopicId, currentNode]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateCamera = () => {
      const cameraY = viewport.scrollTop + viewport.clientHeight / 2;
      const band = layout.zoneBands.find((candidate) => cameraY >= candidate.top && cameraY <= candidate.top + candidate.height);
      if (band) setActiveZoneId(band.zoneId);
    };
    updateCamera();
    viewport.addEventListener("scroll", updateCamera, { passive: true });
    return () => viewport.removeEventListener("scroll", updateCamera);
  }, [layout]);

  const shake = (id: string) => {
    setShakeId(id);
    window.setTimeout(() => setShakeId((current) => current === id ? null : current), 420);
  };

  const stateFor = (node: MapNode, lesson: Lesson, topic: Topic | undefined): VisualNodeState => {
    if (!lesson.playable) return "coming";
    if (node.type === "boss") return bossUnlocked ? "current" : "locked";
    if (topic && completedTopics.includes(topic.id)) return "completed";
    if (node.topicIndex === currentIndex) return "current";
    return "locked";
  };

  const handleNode = (node: MapNode, state: VisualNodeState) => {
    if (state === "coming" || state === "locked") {
      shake(node.id);
      return;
    }
    if (node.type === "boss") onOpenBoss();
    else if (node.topicId) onOpenTopic(node.topicId);
  };

  return (
    <div className="pa-map-scroll" ref={viewportRef} data-positioned={didPosition}>
      <div className="pa-map" style={{ width: `${layout.width}px`, height: `${layout.totalHeight}px` }}>
        <div className="pa-map-layers" aria-hidden="true">
          {layout.zoneBands.map((band) => (
            <div key={band.zoneId} className="pa-zone-band" style={{ top: band.top, height: band.height }}>
              <div className="pa-zone-background" style={{ backgroundImage: `url(${band.background})` }} />
              <div className="pa-zone-midground" style={{ backgroundImage: `url(${band.midground})` }} />
            </div>
          ))}
          {layout.segments.map((segment) => (
            <div key={`${segment.lessonId}-mist`} className="pa-mist-band" style={{ top: segment.top - 110 * layout.scale }} />
          ))}
        </div>

        <svg className="pa-map-trail" viewBox={`0 0 ${layout.width} ${layout.totalHeight}`} aria-hidden="true">
          <path className="pa-trail-future" d={layout.trailPath} pathLength="1" />
          <path className="pa-trail-complete" d={layout.trailPath} pathLength="1" strokeDasharray={`${completedRatio} 1`} />
        </svg>

        {layout.zoneBands.map((band) => (
          <div key={`${band.zoneId}-plaque`} className="pa-zone-plaque pa-plaque" style={{ top: band.top + 38 * layout.scale }}>
            <span className="pa-plaque-label">Zone {band.zoneId} · {band.name}</span>
          </div>
        ))}

        {layout.nodes.map((node) => {
          const lesson = lessons[node.lessonIndex];
          const topic = node.topicIndex === undefined ? undefined : lesson.topics[node.topicIndex];
          const state = stateFor(node, lesson, topic);
          return node.type === "boss" ? (
            <BossNode
              key={node.id}
              node={node}
              lesson={lesson}
              state={state}
              completedTopics={completedTopics}
              shaking={shakeId === node.id}
              onClick={() => handleNode(node, state)}
            />
          ) : (
            <TopicNode
              key={node.id}
              node={node}
              topic={topic}
              state={state}
              shaking={shakeId === node.id}
              onClick={() => handleNode(node, state)}
            />
          );
        })}

        {currentNode && <span className="pa-static-pip" style={{ left: currentNode.x, top: currentNode.y }}><img src="/assets/pip-curious.png" alt="Pip" draggable={false} /></span>}
      </div>
      <div className="pa-map-foreground" style={{ backgroundImage: `url(${frontImage})` }} aria-hidden="true" />
    </div>
  );
}

interface TopicNodeProps {
  node: MapNode;
  topic: Topic | undefined;
  state: VisualNodeState;
  shaking: boolean;
  onClick: () => void;
}

function TopicNode({ node, topic, state, shaking, onClick }: TopicNodeProps) {
  if (!topic) return null;
  const isRightLabel = node.x < 280;
  const label = `${topic.title}, ${state}`;
  return (
    <button type="button" className={`pa-map-node pa-topic-node pa-topic-${state}${shaking ? " pa-shake" : ""}`} style={{ left: node.x, top: node.y }} onClick={onClick} aria-label={label} aria-disabled={state === "locked" || state === "coming"}>
      <span className="pa-node-ground" />
      {state === "coming" ? <span className="pa-coming-socket"><Lock size={18} /></span> : topic.badgeImage ? <Badge id={topic.badgeImage} size={76} className="pa-map-stone" /> : null}
      <span className="pa-map-number">{(node.topicIndex ?? 0) + 1}</span>
      {state === "locked" && <span className="pa-map-lock"><Lock size={15} /></span>}
      {state === "completed" && <span className="pa-map-check"><Check size={14} strokeWidth={3.5} /></span>}
      {state === "current" && <span className="pa-tap-hint">Tap</span>}
      <span className={`pa-topic-label ${isRightLabel ? "pa-label-right" : "pa-label-left"}`}>{topic.title}</span>
    </button>
  );
}

interface BossNodeProps {
  node: MapNode;
  lesson: Lesson;
  state: VisualNodeState;
  completedTopics: string[];
  shaking: boolean;
  onClick: () => void;
}

function BossNode({ node, lesson, state, completedTopics, shaking, onClick }: BossNodeProps) {
  const isLessonOne = lesson.playable;
  return (
    <button type="button" className={`pa-map-node pa-boss-node pa-boss-${state}${shaking ? " pa-shake" : ""}`} style={{ left: node.x, top: node.y }} onClick={onClick} aria-label={`${lesson.title}, ${state}`} aria-disabled={state === "locked" || state === "coming"}>
      {isLessonOne ? <span className="pa-boss-medallion"><img src="/assets/medallion-gloom-slug.png.png" alt="" draggable={false} />{state === "locked" && <span className="pa-map-lock"><Lock size={21} /></span>}</span> : <span className="pa-coming-boss">?</span>}
      {state === "current" && isLessonOne && <span className="pa-boss-fight">Fight!</span>}
      <span className="pa-boss-plaque"><strong>Lesson {lesson.id.replace("lesson-", "")}</strong><span>{lesson.title}</span><small>{isLessonOne ? `Boss: ${lesson.bossName}` : "Coming soon"}</small></span>
      {isLessonOne && <span className="pa-boss-slots">{lesson.topics.map((topic) => topic.badgeImage && <Badge key={topic.id} id={topic.badgeImage} size={18} className={completedTopics.includes(topic.id) ? "pa-slot-filled" : "pa-slot-empty"} />)}</span>}
    </button>
  );
}
