export interface Topic {
  id: string;
  title: string;
  description: string;
  badgeName?: string;
  badgeImage: BadgeImageId;
  questionCount?: number;
}

export interface Lesson {
  id: string;
  zoneId: number;
  title: string;
  topics: Topic[];
  bossName: string;
  playable: boolean;
}

export type BadgeImageId = "voice-spark" | "box-keeper" | "lightning-count" | "scroll-reader";

const topicTitles: Record<number, string[]> = {
  2: ["input() and type conversion", "f-strings and formatting", "string methods and slicing", "booleans and comparisons"],
  3: ["if/elif/else", "and/or/not", "truthiness and nested conditions", "match-case", "one-line conditionals"],
  4: ["for and range()", "while", "break/continue/else", "nested loops and patterns"],
  5: ["indexing and slicing", "list methods", "looping lists", "comprehensions", "copying and mutability"],
  6: ["tuples and unpacking", "set operations", "choosing a container"],
  7: ["keys and values", "dict methods", "looping dicts", "nested dicts", "dict comprehensions", "counting patterns"],
  8: ["def and return", "default and keyword args", "*args and **kwargs", "scope", "docstrings and type hints"],
  9: ["lambda", "map/filter/sorted/zip/enumerate", "recursion", "iterators and generators"],
  10: ["import and packages", "standard library tour", "file I/O", "JSON and CSV", "pip and venv"],
  11: ["try/except/else/finally", "raise and custom exceptions", "debugging and logging", "assert and basic testing"],
  12: ["class, init, self", "instance vs class attributes", "dunder methods"],
  13: ["inheritance and super()", "polymorphism", "encapsulation and properties", "abstract classes", "dataclasses", "composition"],
  14: ["decorators", "context managers", "walrus operator", "typing", "regex"],
  15: ["algorithms and complexity", "sorting and searching", "problem-solving patterns", "threading and asyncio intro", "capstone project"],
};

const lessonTitles: Record<number, string> = {
  2: "Talking to Python", 3: "Making Decisions", 4: "Loop the Loop", 5: "Lists", 6: "Tuples and Sets", 7: "Dictionaries", 8: "Functions", 9: "Smarter Functions", 10: "Modules and Files", 11: "When Things Break", 12: "Classes and Objects", 13: "OOP Power", 14: "Pythonic Pro", 15: "Master Level",
};

function comingSoonTopics(lessonNumber: number): Topic[] {
  return topicTitles[lessonNumber].map((title, index) => ({
    id: `lesson-${lessonNumber}-topic-${index + 1}`,
    title,
    description: `Build confidence with ${title}.`,
  }));
}

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    zoneId: 1,
    title: "Hatchling's First Steps",
    bossName: "Gloom Slug",
    playable: true,
    topics: [
      { id: "topic-1", title: "Say Hello with print()", description: "Make Pip talk to the jungle.", badgeName: "Spell Power", badgeImage: "voice-spark", questionCount: 4 },
      { id: "topic-2", title: "Boxes called Variables", description: "Store things in named boxes.", badgeName: "Bite Power", badgeImage: "box-keeper", questionCount: 3 },
      { id: "topic-3", title: "Numbers and Math", description: "Let Pip count fruits like a pro.", badgeName: "Tail Attack", badgeImage: "lightning-count", questionCount: 3 },
      { id: "topic-4", title: "Words and Strings", description: "Play with text and letters.", badgeName: "Wind Blow", badgeImage: "scroll-reader", questionCount: 3 },
    ],
  },
  ...Array.from({ length: 14 }, (_, index): Lesson => {
    const lessonNumber = index + 2;
    return { id: `lesson-${lessonNumber}`, zoneId: lessonNumber <= 2 ? 1 : lessonNumber <= 4 ? 2 : lessonNumber <= 7 ? 3 : lessonNumber <= 11 ? 4 : 5, title: lessonTitles[lessonNumber], bossName: "???", playable: false, topics: comingSoonTopics(lessonNumber) };
  }),
];
