"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { ClockInCard } from "@/components/dashboard/clock-in-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { AttendanceTable } from "@/components/dashboard/attendance-table"
import { TeamStatus } from "@/components/dashboard/team-status"
import { ScheduleCard } from "@/components/dashboard/schedule-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { NoticesCard } from "@/components/dashboard/notices-card"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

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
            {/* Stats Row */}
            <StatsCards />

            {/* Main Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: Clock-in Card */}
              <ClockInCard />

              {/* Right: Weekly Chart */}
              <WeeklyChart />
            </div>

            {/* Second Row: Schedule + Team + Quick Actions */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ScheduleCard />
              <TeamStatus />
              <QuickActions />
            </div>

            {/* Attendance Records */}
            <div className="mt-6">
              <AttendanceTable />
            </div>

            {/* Notices */}
            <div className="mt-6 mb-6">
              <NoticesCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
