export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-6 motion-reduce:animate-none sm:px-6">
      <div className="h-32 rounded-3xl bg-slate-200" />
      <div className="h-64 rounded-3xl bg-slate-200" />
    </div>
  );
}
