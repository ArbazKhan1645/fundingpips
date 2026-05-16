import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';
import { AIChatbot } from '@/components/sections/ai-chatbot';
import { DashboardGuard } from '@/components/auth/dashboard-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopbar />
          <main className="flex-1 px-3 sm:px-4 py-4 sm:py-5 overflow-auto">
            {children}
          </main>
        </div>
        <AIChatbot />
      </div>
    </DashboardGuard>
  );
}
