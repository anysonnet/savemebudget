// Purely decorative. Placeholder glyphs only; no card or bank data is ever collected.
export function CardStack() {
  return (
    <div className="card-stack" aria-hidden="true">
      <div className="cc cc-1" />
      <div className="cc cc-2" />
      <div className="cc cc-3">
        <div className="flex items-center justify-between">
          <div className="cc-chip" />
          <span className="text-sm font-semibold tracking-wide text-mint-300">SaveMe</span>
        </div>
        <div>
          <p className="cc-dots">•••• •••• •••• ••••</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-white/60">Budget Card</p>
        </div>
      </div>
    </div>
  );
}
