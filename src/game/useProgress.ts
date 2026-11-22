import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pyarena:progress:v1";

export interface ProgressState {
  completedTopics: string[];
  earnedBadges: string[];
}

const empty: ProgressState = { completedTopics: [], earnedBadges: [] };

function read(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.completedTopics) && Array.isArray(parsed.earnedBadges)) {
      return {
        completedTopics: parsed.completedTopics.filter((x: unknown) => typeof x === "string"),
        earnedBadges: parsed.earnedBadges.filter((x: unknown) => typeof x === "string"),
      };
    }
    return empty;
  } catch {
    return empty;
  }
}

function write(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage blocked — keep working in-memory
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => read());

  useEffect(() => {
    write(state);
  }, [state]);

  const isTopicComplete = useCallback(
    (topicId: string) => state.completedTopics.includes(topicId),
    [state.completedTopics]
  );

  const completeTopic = useCallback((topicId: string, badgeId: string) => {
    setState((prev) => {
      if (prev.completedTopics.includes(topicId)) return prev;
      return {
        completedTopics: [...prev.completedTopics, topicId],
        earnedBadges: prev.earnedBadges.includes(badgeId)
          ? prev.earnedBadges
          : [...prev.earnedBadges, badgeId],
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { state, isTopicComplete, completeTopic, reset };
}
