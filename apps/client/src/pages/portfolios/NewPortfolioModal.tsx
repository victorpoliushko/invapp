import { useEffect, useState } from "react";

type Props = {
  onSave: (name: string, goal: number | undefined) => void;
  onClose: () => void;
};

/** Figma: new-portfolio-modal. */
export function NewPortfolioModal({ onSave, onClose }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), goal !== "" ? parseFloat(goal) : undefined);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-portfolio-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 id="new-portfolio-title" className="modal-title">New Portfolio</h2>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Portfolio name</span>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field-label">Annual goal % (optional)</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 10"
              min={0}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
