import { motion } from 'framer-motion'
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import { projects } from '../data/content'

export default function Works() {
  return (
    <section id="works" className="h-screen snap-start bg-white overflow-y-auto">
      <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="italic text-sm 2xl:text-base mb-2">Portfolio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black text-black mb-6 sm:mb-10">MY WORKS</h1>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group cursor-pointer rounded-xl overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-black mb-1">{project.title}</h3>
                <p className="text-xs 2xl:text-sm text-accent-orange font-medium mb-2">{project.tech}</p>
                <p className="text-xs 2xl:text-sm text-gray-500 mb-3">{project.description}</p>
                <div className="flex gap-3">
                  <a href={project.demo} className="flex items-center gap-1 text-xs font-semibold text-black hover:text-accent-orange transition-colors">
                    <FaExternalLinkAlt size={10} /> Demo
                  </a>
                  <a href={project.code} className="flex items-center gap-1 text-xs font-semibold text-black hover:text-accent-orange transition-colors">
                    <FaGithub size={12} /> Code
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
