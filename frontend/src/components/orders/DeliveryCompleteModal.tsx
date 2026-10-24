"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { DeliveryNotePayload } from "@/lib/orders";

type DeliveryCompleteModalProps = {
  isOpen: boolean;
  orderLabel?: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (note: DeliveryNotePayload) => void;
};

export function DeliveryCompleteModal({
  isOpen,
  orderLabel,
  busy = false,
  onClose,
  onConfirm,
}: DeliveryCompleteModalProps) {
  const [signerName, setSignerName] = useState("");
  const [medium, setMedium] = useState<"paper" | "digital">("digital");

  useEffect(() => {
    if (!isOpen) return;
    setSignerName("");
    setMedium("digital");
  }, [isOpen]);

  const canSubmit = signerName.trim().length > 0 && !busy;

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => undefined : onClose}
      title="Complete delivery"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-crust/20 px-3 py-2 text-sm font-medium text-crust hover:bg-cream disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onConfirm({ signerName: signerName.trim(), medium })
            }
            className="rounded-lg bg-crust px-3 py-2 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
          >
            {busy ? "Saving…" : "Confirm complete"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-crust/70">
          {orderLabel
            ? `Record a delivery note for ${orderLabel} before marking completed.`
            : "Record a delivery note before marking this order completed."}
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Signer name
          </label>
          <input
            type="text"
            autoFocus
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Name of person who signed"
            disabled={busy}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Note medium
          </label>
          <div className="flex gap-4 text-sm text-crust">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="delivery-note-medium"
                checked={medium === "digital"}
                onChange={() => setMedium("digital")}
                disabled={busy}
              />
              Digital
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="delivery-note-medium"
                checked={medium === "paper"}
                onChange={() => setMedium("paper")}
                disabled={busy}
              />
              Paper
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
