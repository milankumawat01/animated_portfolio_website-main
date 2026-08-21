import Sidebar from './Sidebar'
import CursorGlow from './CursorGlow'
import ScrollProgress from './ScrollProgress'

export default function Layout({ children }) {
  return (
    <div className="h-screen overflow-hidden bg-dark-deep">
      <CursorGlow />
      <ScrollProgress />
      <Sidebar />
      <main id="main-scroll" className="h-screen overflow-y-auto lg:ml-[200px]">
        {children}
      </main>
    </div>
  )
}
