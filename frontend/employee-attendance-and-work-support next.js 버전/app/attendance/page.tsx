"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import { fetchAttendance, Attendance } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusStyles = {
    NORMAL: "bg-accent/15 text-accent border-0",
    LATE: "bg-destructive/15 text-destructive border-0",
    ABSENT: "bg-destructive/15 text-destructive border-0",
    VACATION: "bg-primary/15 text-primary border-0",
    OVERTIME: "bg-chart-3/15 text-chart-3 border-0",
}

export default function AttendancePage() {
    const [records, setRecords] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAttendance() {
            try {
                const data = await fetchAttendance()
                // Ensure sorting by date desc if API doesn't guarantee it
                // Assuming workDate is comparable string "YYYY-MM-DD" or similar
                // If needed: data.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime())
                setRecords(data)
            } catch (err) {
                console.error("Failed to load attendance", err)
            } finally {
                setLoading(false)
            }
        }
        loadAttendance()
    }, [])

    return (
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[68px] lg:pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">출퇴근 기록</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>전체 출퇴근 내역</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                            ) : (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">날짜</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">출근 시간</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">퇴근 시간</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">근무 시간</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">상태</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">비고</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">기록이 없습니다.</td>
                                                </tr>
                                            ) : (
                                                records.map((record) => (
                                                    <tr key={record.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle font-medium">{record.workDate}</td>
                                                        <td className="p-4 align-middle font-mono">{record.checkInTime || "---"}</td>
                                                        <td className="p-4 align-middle font-mono">{record.checkOutTime || "---"}</td>
                                                        <td className="p-4 align-middle font-mono">
                                                            {record.workHours ? `${Math.floor(record.workHours)}h ${Math.round((record.workHours % 1) * 60)}m` : "---"}
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            <Badge className={statusStyles[record.statusCode as keyof typeof statusStyles] || "bg-secondary text-secondary-foreground"}>
                                                                {record.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 align-middle text-muted-foreground">{record.notes || "-"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
