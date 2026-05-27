import { motion } from 'framer-motion';

type Props = { title: string; text: string; meta?: string };

export function Card({ title, text, meta }: Props) {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.005 }} className="luxury-panel p-6 shadow-halo">
      <p className="text-xs tracking-[0.2em] uppercase text-gold">{meta || 'GRAVEN'}</p>
      <h3 className="mt-3 font-display text-2xl text-champagne">{title}</h3>
      <p className="mt-3 text-zinc-400">{text}</p>
    </motion.article>
  );
}


