import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { ClockInCard } from "@/components/dashboard/clock-in-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { AttendanceTable } from "@/components/dashboard/attendance-table"
import { WorkAndLeaveCard } from "@/components/dashboard/work-and-leave-card"
import { ScheduleCard } from "@/components/dashboard/schedule-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { NoticesCard } from "@/components/dashboard/notices-card"

export default function DashboardPage() {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/login")
        }
    }, [user, isLoading, navigate])

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <SidebarNav />

            {/* Main Content */}
            <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
                <DashboardHeader />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-[1400px] p-6">

                        {/* Main Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left: Clock-in Card */}
                            <ClockInCard onAttendanceUpdate={handleRefresh} />

                            {/* Right: Weekly Chart */}
                            <WeeklyChart key={`weekly-${refreshKey}`} />
                        </div>

                        {/* Attendance Records - Moved Here */}
                        <div className="mt-6">
                            <AttendanceTable key={`table-${refreshKey}`} />
                        </div>

                        {/* Second Row: Schedule + Work/Leave + Quick Actions */}
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <ScheduleCard key={`schedule-${refreshKey}`} />
                            <WorkAndLeaveCard />
                            <QuickActions user={user} onUpdate={handleRefresh} />
                        </div>

                        {/* Notices - Already at bottom, ensure it stays there */}
                        <div className="mt-6 mb-6">
                            <NoticesCard />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
