type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative aspect-square h-full shrink-0 overflow-hidden rounded-sm">
        <img
          src="/imgs/logo.png"
          alt="Graven logo mark"
          className="absolute left-0 top-0 max-w-none object-contain"
          style={{
            height: '368.35%',
            transform: 'translate(-13.48%, -33.11%)',
          }}
        />
      </span>
      <span className="leading-none">
        <span className="block text-[0.9em] font-extrabold tracking-[0.06em] text-zinc-100">GRAVEN</span>
        <span className="mt-1 block text-[0.78em] font-bold tracking-[0.08em] text-zinc-200">METAL</span>
      </span>
    </span>
  );
}
