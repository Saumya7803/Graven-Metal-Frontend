type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="aspect-square h-full shrink-0">
        <img src="/imgs/brand-mark.png" alt="Graven logo" className="h-full w-full object-contain" />
      </span>
      <span className="leading-none">
        <span className="block text-[0.9em] font-extrabold tracking-[0.06em] text-zinc-100">GRAVEN</span>
        <span className="mt-1 block text-[0.78em] font-bold tracking-[0.08em] text-zinc-200">METAL</span>
      </span>
    </span>
  );
}
