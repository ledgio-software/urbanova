import { auth } from '@/auth'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Not an admin (e.g. on /admin/login): render full-screen without the admin sidebar
  if (session?.user?.role !== 'admin') {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full">{children}</main>
    </div>
  )
}
