export interface Zone {
  id: number;
  name: string;
  lessonRange: [number, number];
  background: string;
  midground: string;
}

export const ZONES: Zone[] = [
  { id: 1, name: "Hatchling Jungle", lessonRange: [1, 2], background: "/assets/zones/bg-zone-1.webp", midground: "/assets/zones/mid-zone-1.webp" },
  { id: 2, name: "Crossroads", lessonRange: [3, 4], background: "/assets/zones/bg-zone-2.webp", midground: "/assets/zones/mid-zone-2.webp" },
  { id: 3, name: "Treasure Caves", lessonRange: [5, 7], background: "/assets/zones/bg-zone-3.webp", midground: "/assets/zones/mid-zone-3.webp" },
  { id: 4, name: "Builder's Temple", lessonRange: [8, 11], background: "/assets/zones/bg-zone-4.webp", midground: "/assets/zones/mid-zone-4.webp" },
  { id: 5, name: "Dragon Peak", lessonRange: [12, 15], background: "/assets/zones/bg-zone-5.webp", midground: "/assets/zones/mid-zone-5.webp" },
];
