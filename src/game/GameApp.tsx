import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { JourneyScreen } from "./JourneyScreen";
import { LESSONS } from "./data/lessons";
import { useProgress } from "./useProgress";

export function GameApp() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const { completeTopic, reset } = useProgress();
  const lesson = LESSONS[0];

  const topic = activeTopicId
    ? lesson.topics.find((t) => t.id === activeTopicId) ?? null
    : null;

  if (topic) {
    return (
      <div className="pa-root pa-preview">
        <div className="pa-preview-card">
          <h1 className="pa-preview-title">{topic.title}</h1>
          <p className="pa-preview-sub">Question screen coming next</p>
          <div className="pa-preview-actions">
            <button
              className="pa-btn pa-btn-complete"
              onClick={() => {
                completeTopic(topic.id, topic.badgeImage);
                setActiveTopicId(null);
              }}
            >
              Complete topic (test)
            </button>
            <button className="pa-btn pa-btn-back" onClick={() => setActiveTopicId(null)}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
          <button className="pa-reset-btn pa-preview-reset" onClick={reset}>
            Reset progress
          </button>
        </div>
      </div>
    );
  }

  return <JourneyScreen onOpenTopic={(id) => setActiveTopicId(id)} onExit={() => {}} />;
}
