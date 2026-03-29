import { motion } from 'framer-motion'
import { FaPaperclip, FaTelegram, FaWhatsapp, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'
import { personalInfo, socialLinks } from '../data/content'

export default function Contact() {
  return (
    <section id="contact" className="h-screen snap-start bg-white overflow-y-auto">
      <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="gradient-text italic text-sm 2xl:text-base font-medium mb-2">Contact</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black text-black mb-4 sm:mb-6">REACH OUT TO ME</h1>

            <p className="text-gray-500 text-xs sm:text-sm 2xl:text-base leading-relaxed mb-6 sm:mb-8">
              {personalInfo.address}
            </p>

            <h2 className="text-xl sm:text-2xl md:text-3xl 2xl:text-4xl font-bold text-black mb-1 sm:mb-2">{personalInfo.phone}</h2>
            <h2 className="text-xl sm:text-2xl md:text-3xl 2xl:text-4xl font-bold text-black mb-6 sm:mb-8">{personalInfo.email}</h2>

            <div className="flex flex-wrap gap-4 sm:gap-6 text-[10px] sm:text-xs 2xl:text-sm font-semibold tracking-widest">
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-black hover:text-accent-orange transition-colors flex items-center gap-1">
                <FaLinkedin size={14} /> LINKEDIN
              </a>
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-black hover:text-accent-orange transition-colors flex items-center gap-1">
                <FaGithub size={14} /> GITHUB
              </a>
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-black hover:text-accent-orange transition-colors flex items-center gap-1">
                <FaTelegram size={14} /> TELEGRAM
              </a>
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-black hover:text-accent-orange transition-colors flex items-center gap-1">
                <FaWhatsapp size={14} /> WHATSAPP
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-black hover:text-accent-orange transition-colors flex items-center gap-1">
                <FaInstagram size={14} /> INSTAGRAM
              </a>
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="gradient-bg rounded-2xl p-6 sm:p-8 md:p-10 2xl:p-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl 2xl:text-4xl font-black text-white mb-6 sm:mb-8">ANY PROJECT?</h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <input
                  type="text"
                  placeholder="NAME"
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/70 py-2 text-xs sm:text-sm 2xl:text-base tracking-wider outline-none focus:border-white transition-colors"
                />
                <input
                  type="email"
                  placeholder="EMAIL"
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/70 py-2 text-xs sm:text-sm 2xl:text-base tracking-wider outline-none focus:border-white transition-colors"
                />
              </div>

              <textarea
                placeholder="MESSAGE"
                rows={3}
                className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/70 py-2 text-xs sm:text-sm 2xl:text-base tracking-wider outline-none focus:border-white transition-colors resize-none"
              />

              <label className="flex items-center gap-2 text-white/80 text-xs sm:text-sm cursor-pointer hover:text-white transition-colors">
                <FaPaperclip size={14} />
                <span className="tracking-wider">ATTACH FILE</span>
                <input type="file" className="hidden" />
              </label>

              <button
                type="submit"
                className="bg-dark-deep text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-black transition-colors flex items-center gap-2 rounded"
              >
                Submit now &#8599;
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
