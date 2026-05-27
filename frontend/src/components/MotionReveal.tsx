import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function MotionReveal({ children, delay = 0, className }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, delay, ease: [0.2, 1, 0.33, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
