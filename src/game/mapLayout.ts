import type { Lesson } from "./data/lessons";
import type { Zone } from "./data/zones";

export interface MapNode {
  id: string;
  type: "stone" | "boss";
  lessonId: string;
  lessonIndex: number;
  topicId?: string;
  topicIndex?: number;
  x: number;
  y: number;
  zoneId: number;
}

export interface MapSegment {
  lessonId: string;
  lessonIndex: number;
  zoneId: number;
  top: number;
  height: number;
}

export interface ZoneBand {
  zoneId: number;
  name: string;
  top: number;
  height: number;
  background: string;
  midground: string;
  showPlaque: boolean;
}

export interface MapLayout {
  width: number;
  scale: number;
  totalHeight: number;
  nodes: MapNode[];
  segments: MapSegment[];
  zoneBands: ZoneBand[];
  trailPath: string;
}

interface Point { x: number; y: number; }

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

function catmullRomPath(points: Point[]): string {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y - 90}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    path += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function buildMapLayout(lessons: Lesson[], zones: Zone[], containerWidth: number): MapLayout {
  const width = Math.min(containerWidth, 560);
  const scale = clamp(width / 560, 0.64, 1);
  const bottomPadding = 200 * scale;
  const stoneGap = 130 * scale;
  const lastStoneToBoss = 175 * scale;
  const topPadding = 260 * scale;
  const minimumSegmentHeight = 1.5 * width;

  const segmentHeights = lessons.map((lesson) => Math.max(
    minimumSegmentHeight,
    bottomPadding + Math.max(0, lesson.topics.length - 1) * stoneGap + lastStoneToBoss + topPadding,
  ));
  const totalHeight = segmentHeights.reduce((sum, height) => sum + height, 0);
  const nodes: MapNode[] = [];
  const segments: MapSegment[] = [];
  const zoneBands: ZoneBand[] = [];
  let cumulativeHeight = 0;
  let globalStoneIndex = 0;

  lessons.forEach((lesson, lessonIndex) => {
    const height = segmentHeights[lessonIndex];
    const top = totalHeight - cumulativeHeight - height;
    const firstStoneY = top + height - bottomPadding;
    const stoneNodes = lesson.topics.map((topic, topicIndex) => {
      const x = width * (0.5 + 0.25 * Math.sin(globalStoneIndex * 1.25));
      globalStoneIndex += 1;
      return { id: topic.id, type: "stone" as const, lessonId: lesson.id, lessonIndex, topicId: topic.id, topicIndex, x, y: firstStoneY - topicIndex * stoneGap, zoneId: lesson.zoneId };
    });
    nodes.push(...stoneNodes);
    const lastStone = stoneNodes[stoneNodes.length - 1];
    const bossY = (lastStone?.y ?? firstStoneY) - lastStoneToBoss;
    nodes.push({ id: `${lesson.id}-boss`, type: "boss", lessonId: lesson.id, lessonIndex, x: width / 2, y: bossY, zoneId: lesson.zoneId });
    segments.push({ lessonId: lesson.id, lessonIndex, zoneId: lesson.zoneId, top, height });
    const zone = zones.find((candidate) => candidate.id === lesson.zoneId);
    const previousBand = zoneBands[zoneBands.length - 1];
    if (zone && previousBand?.zoneId === zone.id) {
      previousBand.top = top;
      previousBand.height += height;
    } else if (zone) {
      zoneBands.push({ zoneId: zone.id, name: zone.name, top, height, background: zone.background, midground: zone.midground, showPlaque: true });
    }
    cumulativeHeight += height;
  });

  const trailPoints = nodes.map(({ x, y }) => ({ x, y }));
  return { width, scale, totalHeight, nodes, segments, zoneBands, trailPath: catmullRomPath(trailPoints) };
}
