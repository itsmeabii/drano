import SideBar from '@/components/SideBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-latte">
      <div className="hidden lg:block flex-shrink-0">
        <SideBar />
      </div>
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}