import SideBar from '@/components/SideBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-latte flex h-screen overflow-hidden">
      <div className="hidden shrink-0 lg:block">
        <SideBar />
      </div>
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
