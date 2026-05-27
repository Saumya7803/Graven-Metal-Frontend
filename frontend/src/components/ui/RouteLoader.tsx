export function RouteLoader() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8 md:pt-10">
      <div className="gm-shell gm-fade-in p-6">
        <div className="gm-skeleton h-4 w-44 rounded" />
        <div className="gm-skeleton mt-4 h-10 w-2/3 rounded" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="gm-skeleton h-40 rounded-xl border border-gold/15" />
          <div className="gm-skeleton h-40 rounded-xl border border-gold/15" />
          <div className="gm-skeleton h-40 rounded-xl border border-gold/15" />
        </div>
      </div>
    </div>
  );
}
