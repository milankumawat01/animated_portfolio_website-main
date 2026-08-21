import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus } from 'react-icons/fi'

export default function ServiceAccordion({ services }) {
  const [openIndex, setOpenIndex] = useState(0)

  const toggle = (index) => setOpenIndex(openIndex === index ? -1 : index)

  return (
    <div className="flex flex-col border-t border-line">
      {services.map((service, index) => {
        const isOpen = openIndex === index
        return (
          <div key={service.title} className="border-b border-line">
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-4 py-6 text-left sm:py-7"
            >
              <div className="flex items-baseline gap-4 sm:gap-6">
                <span className="font-mono text-xs text-white/25 sm:text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3
                  className={`text-lg font-black tracking-tight transition-colors sm:text-2xl md:text-3xl ${
                    isOpen ? 'gradient-text' : 'text-white/70 group-hover:text-white'
                  }`}
                >
                  {service.title}
                </h3>
              </div>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isOpen
                    ? 'rotate-180 border-transparent gradient-bg text-white'
                    : 'border-white/15 text-white/50 group-hover:border-white/40 group-hover:text-white'
                }`}
              >
                {isOpen ? <FiMinus size={14} /> : <FiPlus size={14} />}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 pl-10 text-sm leading-relaxed text-white/50 sm:pl-16 sm:text-base">
                    {service.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
