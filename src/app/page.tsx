import { Experience } from '@/engine/Canvas'
import { SiteRuntime } from '@/engine/SiteRuntime'
import { Preloader } from '@/engine/Preloader'
import { DebugHUD } from '@/engine/DebugHUD'
import { Nav, ScrollHint } from '@/components/chrome'
import { sections } from '@/sections'

/**
 * The whole site. One canvas behind, one scrolling column of stations in front.
 *
 * Everything here is server-rendered first, so the DOM layer is a complete, indexable
 * portfolio before a single byte of WebGL runs.
 */
export default function Page() {
  return (
    <>
      <SiteRuntime />
      <Preloader />
      <Experience />

      <Nav />

      <main id="content" style={{ position: 'relative', zIndex: 10 }}>
        {sections.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </main>

      <ScrollHint />
      <DebugHUD />
    </>
  )
}
