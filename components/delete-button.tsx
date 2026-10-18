"use client";

import { useFormStatus } from "react-dom";

export function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`ลบ ${label}`}
      className="rounded-lg px-2.5 py-1.5 text-sm text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
    >
      {pending ? "กำลังลบ…" : "ลบ"}
    </button>
  );
}
