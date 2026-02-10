import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"

export default function SchedulePage() {
    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold">근무 일정</h1>
                    <p className="text-muted-foreground mt-2">근무 일정을 확인하고 관리하는 페이지입니다. (준비 중)</p>
                </main>
            </div>
        </div>
    )
}
