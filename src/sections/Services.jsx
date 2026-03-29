import { motion } from 'framer-motion'
import ServiceAccordion from '../components/ServiceAccordion'
import { services } from '../data/content'

export default function Services() {
  return (
    <section id="services" className="h-screen snap-start bg-white overflow-y-auto">
      <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-black italic text-sm 2xl:text-base mb-2">Service</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black text-black mb-6 sm:mb-10">MY SPECIALTIES</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ServiceAccordion services={services} />
        </motion.div>
      </div>
    </section>
  )
}
