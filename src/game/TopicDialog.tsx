import { useEffect } from "react";
import { X, Clock, HelpCircle, Play, RotateCcw } from "lucide-react";
import type { Topic } from "./data/lessons";
import { Badge } from "./Badges";

interface TopicDialogProps {
  topic: Topic;
  index: number;
  completed: boolean;
  onStart: () => void;
  onClose: () => void;
}

export function TopicDialog({ topic, index, completed, onStart, onClose }: TopicDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pa-dialog-overlay" onClick={onClose}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-label={`Topic ${index + 1}: ${topic.title}`} onClick={(e) => e.stopPropagation()}>
        <button className="pa-dialog-close" onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2.5} />
        </button>
        <div className="pa-dialog-topic-no">Topic {index + 1}</div>
        <h2 className="pa-dialog-title">{topic.title}</h2>
        <p className="pa-dialog-desc">{topic.description}</p>
        <div className="pa-dialog-meta">
          <span className="pa-chip"><HelpCircle size={14} /> {topic.questionCount} questions</span>
          <span className="pa-chip"><Clock size={14} /> 2 min each</span>
        </div>
        <div className="pa-dialog-reward">
          <Badge id={topic.badgeImage} size={56} />
          <div>
            <div className="pa-dialog-reward-label">Badge reward</div>
            <div className="pa-dialog-reward-name">{topic.badgeName}</div>
          </div>
        </div>
        <button className="pa-btn pa-btn-start" onClick={onStart}>
          {completed ? (
            <><RotateCcw size={18} /> Play again</>
          ) : (
            <><Play size={18} /> Start</>
          )}
        </button>
      </div>
    </div>
  );
}
