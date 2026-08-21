import { motion } from 'framer-motion'

/**
 * Scroll-triggered reveal. `dir` picks the direction the element travels from.
 */
export default function Reveal({ children, delay = 0, dir = 'up', className = '', once = true }) {
  const offset = {
    up: { y: 28, x: 0 },
    down: { y: -28, x: 0 },
    left: { x: -32, y: 0 },
    right: { x: 32, y: 0 },
    none: { x: 0, y: 0 },
  }[dir]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
