export function SkeletonCard() {
  return <div className="gm-skeleton h-52 rounded-xl border border-gold/15" />;
}

export function SkeletonTableRow() {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-md border border-gold/10 p-3">
      <div className="gm-skeleton h-3 rounded" />
      <div className="gm-skeleton h-3 rounded" />
      <div className="gm-skeleton h-3 rounded" />
      <div className="gm-skeleton h-3 rounded" />
    </div>
  );
}
