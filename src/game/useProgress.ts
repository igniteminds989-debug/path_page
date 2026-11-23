import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "pyarena:progress:v1";

export interface ProgressState {
  completedTopics: string[];
  earnedBadges: string[];
}

const empty: ProgressState = { completedTopics: [], earnedBadges: [] };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): ProgressState {
  if (!isBrowser()) return empty;
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
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage blocked — keep working in-memory
  }
}

// Module-level shared store
let currentState: ProgressState = isBrowser() ? read() : empty;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressState {
  return currentState;
}

function getServerSnapshot(): ProgressState {
  return empty;
}

function notify(): void {
  for (const l of listeners) l();
}

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isTopicComplete = useCallback(
    (topicId: string) => state.completedTopics.includes(topicId),
    [state.completedTopics]
  );

  const completeTopic = useCallback((topicId: string, badgeId: string) => {
    if (currentState.completedTopics.includes(topicId)) return;
    const next: ProgressState = {
      completedTopics: [...currentState.completedTopics, topicId],
      earnedBadges: currentState.earnedBadges.includes(badgeId)
        ? currentState.earnedBadges
        : [...currentState.earnedBadges, badgeId],
    };
    write(next);
    currentState = next;
    notify();
  }, []);

  const reset = useCallback(() => {
    write(empty);
    try {
      if (isBrowser()) localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    currentState = empty;
    notify();
  }, []);

  return { state, isTopicComplete, completeTopic, reset };
}
