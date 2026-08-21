import { useState, useEffect } from 'react'
import { FaLinkedin, FaGithub, FaInstagram, FaBars, FaTimes } from 'react-icons/fa'
import { personalInfo, socialLinks } from '../data/content'

const navItems = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'ai', label: 'AI WORKFLOW' },
  { id: 'stack', label: 'STACK' },
  { id: 'services', label: 'SERVICES' },
  { id: 'works', label: 'WORK' },
  { id: 'freelance', label: 'FREELANCE' },
  { id: 'contact', label: 'CONTACT' },
]

const socials = [
  { key: 'linkedin', Icon: FaLinkedin, hover: 'hover:text-accent-orange' },
  { key: 'github', Icon: FaGithub, hover: 'hover:text-accent-pink' },
  { key: 'instagram', Icon: FaInstagram, hover: 'hover:text-accent-purple' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const container = document.getElementById('main-scroll')
    if (!container) return

    // Whichever nav section's top has most recently passed the 1/3 mark is "current".
    const handleScroll = () => {
      const threshold = container.scrollTop + container.clientHeight / 3
      let current = navItems[0].id

      for (const item of navItems) {
        const el = document.getElementById(item.id)
        if (el && el.offsetTop <= threshold) current = item.id
      }
      setActiveSection(current)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileOpen(false)
  }

  return (
    <>
      <button
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className="fixed left-4 top-4 z-50 rounded-full border border-white/15 bg-dark-deep/80 p-3 text-white backdrop-blur lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-sidebar flex-col justify-between border-r border-line bg-dark-deep px-6 py-10 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div>
          <button
            onClick={() => scrollTo('home')}
            className="mb-10 block text-left text-3xl font-black text-white"
          >
            Milan<span className="gradient-text-anim">.</span>
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group flex items-center gap-2.5 py-1.5 text-left text-[13px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/85'
                  }`}
                >
                  <span
                    className={`h-px transition-all duration-300 ${
                      isActive ? 'w-5 gradient-bg' : 'w-2 bg-white/25 group-hover:w-4'
                    }`}
                  />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div>
          <a
            href={personalInfo.resume}
            download
            className="mb-6 block rounded-full border border-white/15 py-2.5 text-center text-xs font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            Resume &#8595;
          </a>

          <div className="mb-5 flex gap-2.5">
            {socials.map(({ key, Icon, hover }) => (
              <a
                key={key}
                href={socialLinks[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors ${hover}`}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

          <p className="text-[10px] leading-relaxed text-white/25">
            &copy; 2026 {personalInfo.name}
          </p>
        </div>
      </aside>
    </>
  )
}
