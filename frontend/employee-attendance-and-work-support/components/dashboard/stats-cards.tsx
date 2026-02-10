import { Card, CardContent } from "@/components/ui/card"
import { CalendarCheck, Clock, TrendingUp, Coffee } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchAttendanceByMonth } from "@/lib/api"

export function StatsCards() {
  const [stats, setStats] = useState([
    {
      label: "이번 주 근무시간",
      value: "0h 0m",
      change: "0h",
      changeType: "neutral",
      icon: Clock,
      target: "40h",
    },
    {
      label: "이번 달 출근일",
      value: "0일",
      change: "정상",
      changeType: "neutral",
      icon: CalendarCheck,
      target: "22일",
    },
    {
      label: "이번 달 초과근무",
      value: "0h 0m",
      change: "0h",
      changeType: "neutral",
      icon: TrendingUp,
      target: "한도 20h",
    },
    {
      label: "잔여 연차",
      value: null, // As requested: null if no data
      change: null,
      changeType: "neutral",
      icon: Coffee,
      target: null,
    },
  ])

  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const attendanceData = await fetchAttendanceByMonth(year, month)

        // Calculate Monthly Stats
        const workedDays = attendanceData.length
        const totalWorkHours = attendanceData.reduce((acc, curr) => acc + (curr.workHours || 0), 0)

        // Calculate Overtime (Assuming 8h workday)
        const overtimeHours = Math.max(0, totalWorkHours - (workedDays * 8))

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

        // Helper to format hours (e.g., 8.5 -> 8h 30m)
        const formatHours = (hours: number) => {
          const h = Math.floor(hours)
          const m = Math.round((hours - h) * 60)
          return `${h}h ${m}m`
        }

        setStats([
          {
            label: "이번 주 근무시간",
            value: formatHours(weeklyWorkHours),
            change: "집계중", // Comparative data not available yet
            changeType: "neutral",
            icon: Clock,
            target: "40h",
          },
          {
            label: "이번 달 출근일",
            value: `${workedDays}일`,
            change: "정상",
            changeType: "positive",
            icon: CalendarCheck,
            target: "20일", // Average working days
          },
          {
            label: "이번 달 초과근무",
            value: formatHours(overtimeHours),
            change: overtimeHours > 0 ? "초과" : "정상",
            changeType: overtimeHours > 10 ? "warning" : "positive",
            icon: TrendingUp,
            target: "한도 52h",
          },
          {
            label: "잔여 연차",
            value: null,
            change: null,
            changeType: "neutral",
            icon: Coffee,
            target: null,
          },
        ])
      } catch (error) {
        console.error("Failed to fetch stats", error)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="group transition-colors hover:border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-foreground">
              {stat.value === null ? "정보 없음" : stat.value}
            </p>
            {stat.value !== null && (
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${stat.changeType === "positive"
                    ? "text-accent"
                    : stat.changeType === "warning"
                      ? "text-chart-3"
                      : "text-muted-foreground"
                    }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.target}
                </span>
              </div>
            )}
            {stat.value === null && (
              <div className="mt-2 text-xs text-muted-foreground">
                데이터 연동 준비 중
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

