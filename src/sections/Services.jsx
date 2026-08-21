import ServiceAccordion from '../components/ServiceAccordion'
import { services } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

export default function Services() {
  return (
    <section id="services" className="relative bg-dark-deep py-24 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent-orange/10 blur-[130px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <SectionHeading kicker="Services" title="WHAT I" accent="DO" />

        <Reveal delay={0.1}>
          <div className="mt-10">
            <ServiceAccordion services={services} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
