import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AdminGuard } from '@/components/admin/admin-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 px-3 sm:px-5 py-5 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
