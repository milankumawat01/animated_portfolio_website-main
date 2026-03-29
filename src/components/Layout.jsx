import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar />
      <main
        id="main-scroll"
        className="h-screen lg:ml-[200px] lg:border-l lg:border-gray-200 overflow-y-auto snap-y snap-mandatory"
      >
        {children}
      </main>
    </div>
  )
}
