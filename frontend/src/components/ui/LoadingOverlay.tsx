import { motion } from 'framer-motion';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-full border border-gold/30 bg-[#0a0f14] px-6 py-3 text-gold shadow-glow">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="inline-block h-4 w-4 rounded-full border-2 border-gold/40 border-t-gold"
        />
        <span className="text-sm tracking-wider">Loading</span>
      </div>
    </div>
  );
}
