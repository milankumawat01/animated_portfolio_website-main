import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus } from 'react-icons/fi'

export default function ServiceAccordion({ services }) {
  const [openIndex, setOpenIndex] = useState(2)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <div className="flex flex-col">
      {services.map((service, index) => (
        <div key={index} className="border-t border-gray-200">
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between py-4 sm:py-6 lg:py-8 group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${openIndex === index ? 'gradient-bg' : 'bg-black'}`} />
              <h3
                className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-black transition-colors text-left ${
                  openIndex === index ? 'gradient-text' : 'text-black group-hover:text-gray-600'
                }`}
              >
                {service.title}
              </h3>
            </div>
            <span className="text-xl sm:text-2xl text-gray-400 flex-shrink-0 ml-4">
              {openIndex === index ? <FiMinus /> : <FiPlus />}
            </span>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pb-4 sm:pb-8 pl-5 sm:pl-6">
                  {service.image && (
                    <div className="mb-4 sm:mb-6 max-w-lg">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-32 sm:h-48 md:h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed description shown inline (non-expanded, desktop only) */}
          {openIndex !== index && (
            <div className="hidden lg:block -mt-6 pb-8 pl-6">
              <p className="text-gray-400 text-sm max-w-xl ml-auto mr-16">
                {service.description}
              </p>
            </div>
          )}
        </div>
      ))}
      <div className="border-t border-gray-200" />
    </div>
  )
}
