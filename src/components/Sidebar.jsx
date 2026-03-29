import { FaLinkedin, FaGithub, FaInstagram, FaBars, FaTimes } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { personalInfo, socialLinks } from '../data/content'

const navItems = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'services', label: 'SERVICES' },
  { id: 'works', label: 'WORKS' },
  { id: 'blogs', label: 'BLOGS' },
  { id: 'contact', label: 'CONTACT' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const container = document.getElementById('main-scroll')
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      // Find which section is most visible
      const allSections = container.querySelectorAll('[id]')
      let current = 'home'

      allSections.forEach((section) => {
        const sectionTop = section.offsetTop
        if (scrollTop >= sectionTop - containerHeight / 3) {
          current = section.id
        }
      })

      // Map experience back to about for nav highlight
      if (current === 'experience') current = 'about'
      setActiveSection(current)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-dark text-white p-2 rounded"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-sidebar bg-dark-deep z-40 flex flex-col justify-between py-10 px-6 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div>
          <h1
            className="text-white text-3xl font-black mb-12 cursor-pointer"
            onClick={() => scrollTo('home')}
          >
            {personalInfo.logo}
          </h1>

          {/* Navigation */}
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-sm font-medium tracking-wider transition-colors text-left ${
                    isActive
                      ? 'text-white line-through decoration-2'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full gradient-bg inline-block" />
                    )}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div>
          {/* Social Icons */}
          <div className="flex flex-col gap-4 mb-6">
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent-orange transition-colors w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center">
              <FaLinkedin size={16} />
            </a>
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent-pink transition-colors w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center">
              <FaGithub size={16} />
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent-purple transition-colors w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center">
              <FaInstagram size={16} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-xs leading-relaxed">
            Copyright &copy;2026 {personalInfo.name}. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  )
}
