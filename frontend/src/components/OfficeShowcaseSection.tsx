import { motion } from 'framer-motion';

export function OfficeShowcaseSection() {
  return (
    <section className="relative bg-[#03070b] px-4 py-9 md:px-8 md:py-11">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gold/20 shadow-halo">
        <div className="relative aspect-[16/10.2] sm:aspect-[16/8.4] lg:aspect-[16/6.9]">
          <motion.video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover object-[52%_44%]"
            animate={{ scale: [1.03, 1.08, 1.04], x: [0, -8, 6], y: [0, -3, 3] }}
            transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          >
            <source src="/videos/graven-office.mp4" type="video/mp4" />
          </motion.video>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,11,0.78)_0%,rgba(3,7,11,0.62)_52%,rgba(3,7,11,0.56)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.44)_60%,rgba(0,0,0,0.68)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(214,176,92,0.2),transparent_42%)]" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.65)]" />
        </div>

        <div className="absolute inset-0 z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-5 py-8 sm:px-7 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h2
              className="font-display text-4xl font-semibold tracking-[0.05em] text-white sm:text-5xl md:text-6xl"
              style={{ textShadow: '0 10px 35px rgba(0,0,0,0.72), 0 0 28px rgba(214,176,92,0.16)' }}
            >
              Our Office
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
