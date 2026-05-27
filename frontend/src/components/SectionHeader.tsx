type Props = {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ eyebrow, title, text, action }: Props) {
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
      <div className="relative">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.26em] text-gold">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl md:text-4xl">{title}</h2>
        <span className="mt-3 block h-px w-16 bg-gradient-to-r from-gold/70 to-transparent" />
        {text ? <p className="mt-2 max-w-2xl text-sm text-zinc-400 md:text-base">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}
