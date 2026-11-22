import { useEffect } from "react";
import { X } from "lucide-react";

interface BossDialogProps {
  bossName: string;
  onClose: () => void;
}

export function BossDialog({ bossName, onClose }: BossDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pa-dialog-overlay" onClick={onClose}>
      <div className="pa-dialog pa-dialog-boss" role="dialog" aria-modal="true" aria-label={`Boss: ${bossName}`} onClick={(e) => e.stopPropagation()}>
        <button className="pa-dialog-close" onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2.5} />
        </button>
        <div className="pa-boss-icon" aria-hidden="true" />
        <h2 className="pa-dialog-title">{bossName}</h2>
        <p className="pa-dialog-desc">Boss fight coming soon</p>
      </div>
    </div>
  );
}
