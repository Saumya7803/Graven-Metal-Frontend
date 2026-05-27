import { Link } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
  to?: string;
  variant?: 'primary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
};

export function Button({ children, to, variant = 'primary', type = 'button' }: Props) {
  const cls =
    variant === 'primary'
      ? 'group gm-hover-lift relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gold-cta px-5 py-2.5 font-semibold text-black shadow-gold transition hover:brightness-110'
      : 'group gm-hover-lift relative inline-flex items-center justify-center overflow-hidden rounded-md border border-gold/35 bg-[#091018] px-5 py-2.5 text-gold shadow-insetgold transition hover:border-gold/60 hover:bg-gold/10';

  const inner = <span className="relative z-10">{children}</span>;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
        <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-steel-sheen opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
      </Link>
    );
  }

  return (
    <button type={type} className={cls}>
      {inner}
      <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-steel-sheen opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  );
}
