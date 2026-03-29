import { motion } from 'framer-motion'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaDownload } from 'react-icons/fa'
import { personalInfo, stats, aboutDescription, aboutStatsDescription, quote, experience, education } from '../data/content'

export default function About() {
  return (
    <>
      {/* Top Section - White */}
      <section id="about" className="h-screen snap-start bg-white overflow-y-auto">
        <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-accent-orange italic text-sm 2xl:text-base mb-2">Nice to meet you!</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black text-black mb-6 sm:mb-10">WELCOME TO...</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left - Profile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 2xl:w-64 2xl:h-64 rounded-full overflow-hidden border-4 border-gray-100 mb-4 sm:mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white italic text-sm sm:text-lg font-light opacity-80 drop-shadow-lg whitespace-nowrap">
                  Milan Kumawat
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl 2xl:text-4xl font-bold gradient-text mb-1">{personalInfo.name.toUpperCase()}</h2>
              <p className="text-gray-600 text-sm sm:text-base 2xl:text-lg mb-3 sm:mb-4 text-center lg:text-left">
                <span className="font-semibold">{personalInfo.title}</span> based in{' '}
                <span className="font-bold text-black">{personalInfo.location}</span>
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-black text-sm sm:text-base font-semibold underline underline-offset-4 decoration-2 hover:text-accent-orange transition-colors">
                Download CV <FaDownload size={12} />
              </a>
            </motion.div>

            {/* Right - Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaPhone className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-xs sm:text-sm 2xl:text-base text-gray-700">{personalInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaUser className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-xs sm:text-sm 2xl:text-base text-gray-700">{personalInfo.age}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaEnvelope className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-xs sm:text-sm 2xl:text-base text-gray-700 break-all">{personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-xs sm:text-sm 2xl:text-base text-gray-700">{personalInfo.country}, {personalInfo.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-5 sm:mb-6">
                <div>
                  <span className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black gradient-text">{stats.yearsExperience}</span>
                  <p className="text-xs sm:text-sm 2xl:text-base text-gray-500 mt-1">
                    <span className="font-semibold text-black">Years</span><br />experience...
                  </p>
                  <p className="text-[10px] sm:text-xs 2xl:text-sm text-gray-500 mt-2 leading-relaxed hidden sm:block">{aboutDescription}</p>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black gradient-text">{stats.projectsCompleted}</span>
                  <p className="text-xs sm:text-sm 2xl:text-base text-gray-500 mt-1">
                    <span className="font-semibold text-black">Projects</span><br />Completed...
                  </p>
                  <p className="text-[10px] sm:text-xs 2xl:text-sm text-gray-500 mt-2 leading-relaxed hidden sm:block">{aboutStatsDescription}</p>
                </div>
              </div>

              <div className="gradient-bg rounded-xl p-4 sm:p-6 text-white">
                <span className="text-2xl sm:text-4xl font-serif leading-none">&ldquo;&ldquo;</span>
                <p className="italic text-xs sm:text-sm 2xl:text-base leading-relaxed mt-1 sm:mt-2">{quote}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="h-screen snap-start gradient-bg overflow-y-auto">
        <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-yellow-200 italic text-sm 2xl:text-base mb-2">Experience</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-black text-white mb-4 sm:mb-6">MY EXPERIENCE</h2>
              <p className="text-white/80 text-xs sm:text-sm 2xl:text-base leading-relaxed mb-6 sm:mb-8">
                Hello there! I'm Milan Kumawat.<br />
                An AI Engineer & Full-Stack Developer, passionate about building intelligent systems and scalable applications.
              </p>
              <button className="bg-dark-deep text-white px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-black transition-colors flex items-center gap-2 rounded">
                Download my resume <FaDownload size={12} />
              </button>
            </motion.div>

            <div className="flex flex-col gap-5 sm:gap-8">
              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="border-t border-white/30 pt-3 sm:pt-4"
                >
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <span className="text-yellow-200 text-xs sm:text-sm 2xl:text-base italic">-{exp.period}</span>
                    <span className="text-white/70 text-xs sm:text-sm 2xl:text-base italic">-{exp.company}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl 2xl:text-3xl font-black text-white">{exp.role}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
