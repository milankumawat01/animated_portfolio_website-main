import { motion } from 'framer-motion'
import { FaPhone, FaEnvelope } from 'react-icons/fa'
import { personalInfo } from '../data/content'

export default function Home() {
  return (
    <section id="home" className="h-screen snap-start bg-dark-deep relative overflow-hidden">
      <div className="h-full flex items-center px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 w-full items-center max-w-[1600px] mx-auto">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="z-10 order-2 lg:order-1"
          >
            <h1 className="text-white text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black leading-[1.1] mb-3 sm:mb-4">
              <span className="italic font-light text-[0.7em]">MY</span>{' '}
              <span className="font-black">NAME</span>
              <br />
              <span className="italic font-light text-[0.7em]">IS</span>{' '}
              <span className="font-black">MILAN</span>
              <br />
              <span className="font-black">KUMAWAT...</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base md:text-lg 2xl:text-xl mb-4 sm:mb-6">
              <span className="italic">{personalInfo.title}</span> based in{' '}
              <span className="font-bold text-white">{personalInfo.location}</span>
            </p>

            <button className="bg-white text-black px-5 sm:px-6 2xl:px-8 py-2.5 sm:py-3 2xl:py-4 rounded-full text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-gray-200 transition-colors mb-6 sm:mb-8 flex items-center gap-2">
              Hire Me
            </button>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 text-gray-400 text-xs sm:text-sm 2xl:text-base">
              <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <FaPhone className="text-accent-orange" size={14} />
                {personalInfo.phone}
              </a>
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <FaEnvelope className="text-accent-orange" size={14} />
                {personalInfo.email}
              </a>
            </div>
          </motion.div>

          {/* Right side - Profile image with decorative shapes */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-center h-[200px] sm:h-[300px] md:h-[350px] lg:h-[450px] 2xl:h-[550px] order-1 lg:order-2"
          >
            {/* Decorative diamond shapes */}
            <div className="absolute -top-4 right-4 lg:right-8">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-white">
                <polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            <div className="absolute top-4 right-12 lg:right-16">
              <svg width="20" height="20" viewBox="0 0 20 20" className="text-accent-orange">
                <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" />
              </svg>
            </div>

            {/* Orange/pink gradient blob behind image */}
            <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 2xl:w-[400px] 2xl:h-[400px] rounded-full bg-gradient-to-br from-accent-orange to-accent-pink opacity-80 blur-sm" />

            {/* Additional accent blobs */}
            <div className="absolute -bottom-4 -right-4 w-20 sm:w-28 2xl:w-36 h-20 sm:h-28 2xl:h-36 rounded-full bg-accent-orange opacity-70" />
            <div className="absolute bottom-16 -left-4 w-12 sm:w-16 2xl:w-24 h-12 sm:h-16 2xl:h-24 rounded-full bg-accent-pink opacity-60" />

            {/* Profile image */}
            <div className="relative z-10 w-40 h-48 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 2xl:w-96 2xl:h-[440px] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&crop=face"
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
