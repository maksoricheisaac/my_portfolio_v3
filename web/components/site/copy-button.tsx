"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label,
  doneLabel,
}: {
  value: string;
  label: string;
  doneLabel: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // Clipboard unavailable: the address is still visible and selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm transition-colors hover:border-signal/60"
    >
      {done ? <Check className="size-4 text-signal" /> : <Copy className="size-4" />}
      <span aria-live="polite">{done ? doneLabel : label}</span>
    </button>
  );
}
