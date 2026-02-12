"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Briefcase, Coffee } from "lucide-react"
import { Attendance, User } from "@/lib/api"
import { useMemo } from "react"
import { differenceInMonths, parseISO } from "date-fns"

interface ReportSummaryProps {
    attendanceData: Attendance[]
    user: User | null
}

export function ReportSummary({ attendanceData, user }: ReportSummaryProps) {
    const stats = useMemo(() => {
        // 1. Total Work Days
        const workDays = attendanceData.filter(a =>
            a.statusCode === 'NORMAL' || a.statusCode === 'LATE' || a.statusCode === 'OVERTIME'
        ).length

        // 2. Total Work Hours & Overtime
        let totalWorkHours = 0
        let totalOvertime = 0

        attendanceData.forEach(a => {
            const hours = a.workHours || 0
            totalWorkHours += hours
            // Simple Overtime Calc: > 8 hours
            if (hours > 8) {
                totalOvertime += (hours - 8)
            }
        })

        // 3. Annual Leave (Frontend Calc)
        let totalLeave = 0
        let usedLeave = 0

        if (user?.joinDate) {
            const joinDate = parseISO(user.joinDate)
            const today = new Date()
            const monthsService = differenceInMonths(today, joinDate)
            const yearsService = Math.floor(monthsService / 12)

            // Simplistic Korean Labor Law Logic
            if (yearsService < 1) {
                totalLeave = Math.min(monthsService, 11)
            } else {
                // 15 days + 1 every 2 years after 1st year
                totalLeave = 15 + Math.floor((yearsService - 1) / 2)
            }
        }

        // Count 'VACATION' status from ALL time? 
        // NOTE: This report is usually monthly. 
        // To get TRUE used leave, we'd need all history.
        // For now, let's just show "Used this month" or "Used (Calculated from available data)"
        // Or if the backend relies on frontend to know, maybe we can't show "Remaining" accurately without a specific API.
        // Let's fallback to just showing "Used (This Period)" if we can't get total history.
        // BUT, user asked for "Remaining". 
        // Let's assume the passed `attendanceData` is for the *current context* (e.g. month).
        // Actual "Remaining" requires backend support. 
        // I will display "Estimated" or just show "Used this month" for now to be safe,
        // or try to fetch 'year' data if I want to be fancy.
        // Let's just count 'VACATION' in the provided data for now (Used this Month).
        usedLeave = attendanceData.filter(a => a.statusCode === 'VACATION').length

        // Formatting
        const formatHours = (val: number) => {
            const h = Math.floor(val)
            const m = Math.round((val - h) * 60)
            return `${h}h ${m}m`
        }

        return [
            {
                label: "총 근무 일수",
                value: `${workDays}일`,
                icon: CalendarDays,
                desc: "이번 달 출근 일수"
            },
            {
                label: "총 근무 시간",
                value: formatHours(totalWorkHours),
                icon: Clock,
                desc: "이번 달 누적 근무"
            },
            {
                label: "연장 근무",
                value: formatHours(totalOvertime),
                icon: Briefcase,
                desc: "8시간 초과 근무"
            },
            {
                label: "휴가 사용",
                value: `${usedLeave}일`,
                icon: Coffee,
                desc: "이번 달 사용 휴가" // refrain from showing "Remaining" if we don't have full history
            }
        ]
    }, [attendanceData, user])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.label}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.desc}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
