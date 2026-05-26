import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OfficeShowcaseSection } from '../components/OfficeShowcaseSection';

export function Layout() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [showRouteLine, setShowRouteLine] = useState(false);
  const isHomeRoute = location.pathname === '/';
  const isAboutRoute = location.pathname === '/about';
  const isFullBleedRoute =
    isHomeRoute || location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/auth';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [location.pathname, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    setShowRouteLine(true);
    const timer = window.setTimeout(() => setShowRouteLine(false), 480);
    return () => window.clearTimeout(timer);
  }, [location.pathname, prefersReducedMotion]);

  return (
    <div id="top" className="min-h-screen overflow-x-clip bg-coal">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-amberlux/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-[40rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-platinum/5 to-transparent blur-2xl" />
      </div>
      <AnimatePresence>
        {showRouteLine ? (
          <motion.div
            key={location.pathname}
            initial={{ scaleX: 0, opacity: 0.8 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gold-cta shadow-gold"
          />
        ) : null}
      </AnimatePresence>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-gold">
        Skip to content
      </a>
      {isHomeRoute ? null : <Navbar />}
      <main
        id="main-content"
        className={`relative z-10 mx-auto w-full ${
          isFullBleedRoute
            ? 'max-w-none px-0 pt-0'
            : 'max-w-7xl px-4 pt-5 sm:pt-7 md:px-8 md:pt-11'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(2px)' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {isAboutRoute ? <OfficeShowcaseSection /> : null}
      <Footer />
    </div>
  );
}
