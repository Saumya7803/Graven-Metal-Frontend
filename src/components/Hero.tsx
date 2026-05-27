import { motion } from 'framer-motion';

type Props = { title: string; text: string; cta?: string };

export function Hero({ title, text, cta }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.68 }}
      className="luxury-panel bg-luxury-radial p-5 sm:p-8 md:p-14"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-gold">GRAVEN METAL</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-champagne sm:text-4xl md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-zinc-300">{text}</p>
      {cta ? <button className="mt-8 rounded-full bg-gradient-to-r from-brass to-gold px-6 py-3 font-semibold text-black shadow-gold transition hover:scale-105 hover:brightness-110">{cta}</button> : null}
    </motion.section>
  );
}


