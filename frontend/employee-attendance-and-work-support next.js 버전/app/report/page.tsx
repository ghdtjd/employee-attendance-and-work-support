"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { useState, useEffect } from "react"
import { Attendance, User, fetchAttendanceByMonth, checkLogin } from "@/lib/api"
import { ReportSummary } from "@/components/report/report-summary"
import { WorkTrendChart } from "@/components/report/work-trend-chart"
import { StatusPieChart } from "@/components/report/status-pie-chart"
import { RequestList } from "@/components/report/request-list"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function ReportPage() {
    const [loading, setLoading] = useState(true)
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
    const [user, setUser] = useState<User | null>(null)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                // Load User Info
                const userData = await checkLogin()
                setUser(userData)

                // Load Attendance (default: current month)
                const data = await fetchAttendanceByMonth(selectedYear, selectedMonth)
                setAttendanceData(data)
            } catch (error) {
                console.error("Failed to load report data", error)
                toast.error("데이터를 불러오는데 실패했습니다.")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [selectedYear, selectedMonth])

    return (
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[68px] lg:pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">근태 리포트</h1>
                        <div className="flex gap-2">
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={(v) => setSelectedYear(Number(v))}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2024, 2025, 2026].map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}년</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedMonth.toString()}
                                onValueChange={(v) => setSelectedMonth(Number(v))}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <SelectItem key={m} value={m.toString()}>{m}월</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                            데이터 분석 중...
                        </div>
                    ) : (
                        <>
                            <ReportSummary attendanceData={attendanceData} user={user} />

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <WorkTrendChart data={attendanceData} />
                                <StatusPieChart data={attendanceData} />
                                <RequestList />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
