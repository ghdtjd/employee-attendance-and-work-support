"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Coffee } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchAttendanceByMonth, fetchMyInfo } from "@/lib/api"

export function WorkAndLeaveCard() {
    const [stats, setStats] = useState([
        {
            label: "이번 주 근무시간",
            value: "0h 0m",
            change: "집계중",
            changeType: "neutral",
            icon: Clock,
            target: "40h",
        },
        {
            label: "잔여 연차",
            value: null as string | null,
            change: null as string | null,
            changeType: "neutral",
            icon: Coffee,
            target: null as string | null,
        },
    ])

    useEffect(() => {
        async function loadStats() {
            try {
                const now = new Date()
                const year = now.getFullYear()
                const month = now.getMonth() + 1

                // Fetch both concurrently
                const [attendanceData, userInfo] = await Promise.all([
                    fetchAttendanceByMonth(year, month),
                    fetchMyInfo()
                ])

                // Calculate Weekly Stats
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
                startOfWeek.setHours(0, 0, 0, 0)

                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
                endOfWeek.setHours(23, 59, 59, 999)

                const weeklyAttendance = attendanceData.filter(a => {
                    const workDate = new Date(a.workDate)
                    return workDate >= startOfWeek && workDate <= endOfWeek
                })
                const weeklyWorkHours = weeklyAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0)

                // Helper to format hours
                const formatHours = (hours: number) => {
                    const h = Math.floor(hours)
                    const m = Math.round((hours - h) * 60)
                    return `${h}h ${m}m`
                }

                setStats([
                    {
                        label: "이번 주 근무시간",
                        value: formatHours(weeklyWorkHours),
                        change: "이번 주 누적",
                        changeType: "neutral",
                        icon: Clock,
                        target: "목표 40h",
                    },
                    {
                        label: "잔여 연차",
                        value: userInfo.remainingLeave !== undefined ? `${userInfo.remainingLeave}일` : "정보 없음",
                        change: `사용 ${userInfo.usedLeave || 0}일`,
                        changeType: "neutral",
                        icon: Coffee,
                        target: `총 ${userInfo.totalLeave || 0}일`,
                    },
                ])
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }
        loadStats()
    }, [])

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-none">
                <CardTitle className="text-lg font-bold text-foreground">
                    근태 현황
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1 grid grid-rows-2 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono tracking-tight">{stat.value === null ? "정보 없음" : stat.value}</span>
                            {stat.value === null && (
                                <span className="text-xs text-muted-foreground">연동 준비 중</span>
                            )}
                        </div>
                        {stat.value !== null && (
                            <div className="mt-1 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{stat.change}</span>
                                <span className="text-muted-foreground">{stat.target}</span>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
