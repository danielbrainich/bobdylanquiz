"use client";

import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Leave",
  cancelLabel = "Stay",
  onConfirm,
  onCancel,
  singleAction = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  singleAction?: boolean;
}) {
  const dismiss = singleAction ? onConfirm : onCancel ?? onConfirm;

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={dismiss}
      role="presentation"
    >
      <div
        className="modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="poster-heading" style={{ marginBottom: "0.5rem" }}>
          {title}
        </h2>
        <p id="confirm-modal-message" className="typewriter" style={{ marginBottom: "1.25rem" }}>
          {message}
        </p>
        <div className="modal-actions">
          {!singleAction && (
            <button type="button" className="btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
