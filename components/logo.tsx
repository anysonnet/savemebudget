import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg">
      <span className="grid size-8 place-items-center rounded-lg bg-mint-400 text-navy-900">฿</span>
      <span className={light ? "text-white" : "text-navy-900"}>SaveMe Budget</span>
    </Link>
  );
}
