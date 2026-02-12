import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"

export default function ReportsPage() {
    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold">근태 리포트</h1>
                    <p className="text-muted-foreground mt-2">근태 리포트를 확인하는 페이지입니다. (준비 중)</p>
                </main>
            </div>
        </div>
    )
}
