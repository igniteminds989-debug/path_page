import { useEffect, useMemo, useState } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import "./game.css";
import { LESSONS } from "./data/lessons";
import { useProgress } from "./useProgress";
import { ParallaxScene } from "./ParallaxScene";
import { JourneyMap } from "./JourneyMap";
import { TopicDialog } from "./TopicDialog";
import { BossDialog } from "./BossDialog";

interface JourneyScreenProps {
  onOpenTopic: (topicId: string) => void;
  onExit: () => void;
}

export function JourneyScreen({ onOpenTopic, onExit }: JourneyScreenProps) {
  const lesson = LESSONS[0];
  const { state, isTopicComplete, reset } = useProgress();
  const [dialogTopicId, setDialogTopicId] = useState<string | null>(null);
  const [bossDialog, setBossDialog] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const completedCount = lesson.topics.filter((t) => state.completedTopics.includes(t.id)).length;
  const bossUnlocked = completedCount === lesson.topics.length;

  const currentIndex = useMemo(() => {
    for (let i = 0; i < lesson.topics.length; i++) {
      if (!state.completedTopics.includes(lesson.topics[i].id)) return i;
    }
    return lesson.topics.length - 1;
  }, [state.completedTopics, lesson.topics]);

  const dialogTopic = dialogTopicId
    ? lesson.topics.find((t) => t.id === dialogTopicId) ?? null
    : null;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="pa-root">
      <ParallaxScene reducedMotion={reducedMotion} />

      <div className="pa-topbar">
        <button className="pa-logo" onClick={onExit} aria-label="PyArena home">
          <span className="pa-logo-mark">{"}>_"}</span>
          <span className="pa-logo-text">PyArena</span>
        </button>
        <span className="pa-progress-chip">Lesson 1 · {completedCount}/{lesson.topics.length} topics</span>
        <div className="pa-topbar-right">
          <button
            className="pa-icon-btn"
            onClick={() => setSoundOn((v) => !v)}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="pa-reset-btn" onClick={reset} aria-label="Reset progress">
            <RotateCcw size={13} /> Reset progress
          </button>
        </div>
      </div>

      <div className="pa-banner">
        <div className="pa-plaque">
          <span className="pa-plaque-label">Lesson 1</span>
          <h1 className="pa-plaque-title">Hatchling's First Steps</h1>
        </div>
      </div>

      <JourneyMap
        lesson={lesson}
        completedTopics={state.completedTopics}
        currentIndex={currentIndex}
        bossUnlocked={bossUnlocked}
        onOpenTopic={(id) => setDialogTopicId(id)}
        onOpenBoss={() => setBossDialog(true)}
        reducedMotion={reducedMotion}
      />

      {dialogTopic && (
        <TopicDialog
          topic={dialogTopic}
          index={lesson.topics.findIndex((t) => t.id === dialogTopic.id)}
          completed={isTopicComplete(dialogTopic.id)}
          onStart={() => {
            const id = dialogTopic.id;
            setDialogTopicId(null);
            onOpenTopic(id);
          }}
          onClose={() => setDialogTopicId(null)}
        />
      )}

      {bossDialog && (
        <BossDialog bossName={lesson.bossName} onClose={() => setBossDialog(false)} />
      )}
    </div>
  );
}
