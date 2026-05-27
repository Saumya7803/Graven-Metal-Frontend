import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { companyDetails } from '../data/demoContent';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/live-prices', label: 'Live Prices' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-[#04080d]/92 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="hidden border-b border-gold/10 bg-[#050b12]/90 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-2 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
          <p>{companyDetails.tagline}</p>
          <div className="flex items-center gap-5">
            <a href={`tel:${companyDetails.phone}`} className="hover:text-champagne">
              {companyDetails.phone}
            </a>
            <a href={`mailto:${companyDetails.email}`} className="hover:text-champagne">
              {companyDetails.email}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8 md:py-4">
        <Link to="/" className="group inline-flex items-center font-display tracking-wide text-champagne">
          <BrandLogo className="h-9 sm:h-10" />
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-md border border-gold/35 bg-[#0a121b] px-3 py-1.5 text-sm text-gold shadow-insetgold md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <button
          type="button"
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`${open ? 'fixed' : 'hidden'} inset-0 z-40 bg-black/70 md:hidden`}
        />

        <nav
          id="primary-nav"
          className={`${
            open ? 'translate-x-0' : 'translate-x-full'
          } fixed right-0 top-0 z-50 flex h-screen w-[84%] max-w-[336px] flex-col gap-1 border-l border-gold/20 bg-[#070b10] p-6 shadow-halo transition-transform duration-300 md:static md:h-auto md:w-auto md:max-w-none md:translate-x-0 md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <p className="mb-4 font-display text-lg text-white md:hidden">Navigation</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `relative rounded-md px-2.5 py-2 text-[11px] uppercase tracking-[0.2em] ${
                  isActive
                    ? 'bg-gold/10 text-gold md:bg-transparent md:after:absolute md:after:bottom-0 md:after:left-2 md:after:right-2 md:after:h-px md:after:bg-gradient-to-r md:after:from-transparent md:after:via-gold md:after:to-transparent'
                    : 'text-zinc-300 hover:text-champagne md:text-zinc-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/quote-request"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-gold-cta px-3.5 py-2 text-xs font-semibold text-black shadow-gold transition hover:brightness-110 md:mt-0 md:ml-1"
          >
            Request Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
