import SideBar from '@/components/SideBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-latte">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}