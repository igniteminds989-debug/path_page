export interface Topic {
  id: string;
  title: string;
  description: string;
  badgeName: string;
  badgeImage: BadgeImageId;
  questionCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  topics: Topic[];
  bossName: string;
}

export type BadgeImageId = "voice-spark" | "box-keeper" | "lightning-count" | "scroll-reader";

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "Hatchling's First Steps",
    bossName: "Gloom Slug",
    topics: [
      {
        id: "topic-1",
        title: "Say Hello with print()",
        description: "Make Pip talk to the jungle.",
        badgeName: "Spell Power",
        badgeImage: "voice-spark",
        questionCount: 3,
      },
      {
        id: "topic-2",
        title: "Boxes called Variables",
        description: "Store things in named boxes.",
        badgeName: "Bite Power",
        badgeImage: "box-keeper",
        questionCount: 3,
      },
      {
        id: "topic-3",
        title: "Numbers and Math",
        description: "Let Pip count fruits like a pro.",
        badgeName: "Tail Attack",
        badgeImage: "lightning-count",
        questionCount: 3,
      },
      {
        id: "topic-4",
        title: "Words and Strings",
        description: "Play with text and letters.",
        badgeName: "Wind Blow",
        badgeImage: "scroll-reader",
        questionCount: 3,
      },
    ],
  },
];
