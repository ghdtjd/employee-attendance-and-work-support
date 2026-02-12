import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { useState, useEffect } from "react"
import { fetchAttendanceByMonth, Attendance } from "@/lib/api"
import { isSameDay } from "date-fns"

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs font-medium text-foreground">{label}요일</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs text-muted-foreground">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name === "hours" ? "정규" : "초과"}: {entry.value}h
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function WeeklyChart() {
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; overtime: number }[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const attendanceData = await fetchAttendanceByMonth(year, month)

        // Normalize Date helper
        const normalizeDate = (date: Date) => {
          const d = new Date(date)
          d.setHours(0, 0, 0, 0)
          return d
        }

        // Calculate Start of Week (Monday)
        const currentDay = now.getDay() // 0=Sun, 1=Mon ... 6=Sat
        const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
        const startOfWeek = new Date(now)
        startOfWeek.setDate(diff)
        const normalizedStart = normalizeDate(startOfWeek)

        const weekDataMap = new Map<string, Attendance>()

        // Map attendance by date string (YYYY-MM-DD)
        attendanceData.forEach(a => {
          weekDataMap.set(a.workDate, a)
        })

        const days = ["월", "화", "수", "목", "금", "토", "일"]
        const newWeeklyData = days.map((dayLabel, index) => {
          const dayDate = new Date(normalizedStart)
          dayDate.setDate(normalizedStart.getDate() + index)

          // Format YYYY-MM-DD
          const year = dayDate.getFullYear()
          const month = String(dayDate.getMonth() + 1).padStart(2, '0')
          const day = String(dayDate.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`

          const record = weekDataMap.get(dateStr)
          let totalHours = record?.workHours || 0

          // Calculate hours dynamically if workHours is missing but we have check-in time
          if (record && !totalHours && record.checkInTime) {
            const [inH, inM] = record.checkInTime.split(':').map(Number)
            const checkInDate = new Date(dayDate)
            checkInDate.setHours(inH, inM, 0, 0)

            let checkOutDate = new Date()

            if (record.checkOutTime) {
              const [outH, outM] = record.checkOutTime.split(':').map(Number)
              checkOutDate = new Date(dayDate)
              // Handle next day checkout if needed (simplified assumption: same day or handled by backend usually)
              // For now assume same day checkout for simplicity or handling basic cases
              if (outH < inH) {
                checkOutDate.setDate(checkOutDate.getDate() + 1);
              }
              checkOutDate.setHours(outH, outM, 0, 0)
            } else if (isSameDay(dayDate, new Date())) {
              // If today and not checked out, use current time
              checkOutDate = new Date()
            } else {
              // Past day without checkout -> ignore or treat as 0? 
              // Let's treat as 0 or 8h default? 
              // Better to treat as 0 if not checked out in past.
              checkOutDate = checkInDate // Result 0
            }

            const diffMs = checkOutDate.getTime() - checkInDate.getTime()
            if (diffMs > 0) {
              totalHours = diffMs / (1000 * 60 * 60)
            }
          }

          // Cap regular hours at 8, rest is overtime
          const regular = Math.min(totalHours, 8)
          const overtime = Math.max(0, totalHours - 8)

          return {
            day: dayLabel,
            hours: Number(regular.toFixed(1)),
            overtime: Number(overtime.toFixed(1))
          }
        })

        setWeeklyData(newWeeklyData)
      } catch (error) {
        console.error("Failed to load weekly chart data", error)
      }
    }
    loadData()
  }, [])

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">
            주간 근무시간
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              정규
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-chart-3" />
              초과
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={weeklyData}
            margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(240 4% 16%)"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(240 4% 55%)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(240 4% 55%)" }}
              tickFormatter={(v: number) => `${v}h`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(240 4% 14% / 0.5)" }}
            />
            <ReferenceLine
              y={8}
              stroke="hsl(240 4% 30%)"
              strokeDasharray="4 4"
              label={{
                value: "8h",
                position: "right",
                style: { fontSize: 10, fill: "hsl(240 4% 55%)" },
              }}
            />
            <Bar
              dataKey="hours"
              stackId="stack"
              fill="hsl(217 91% 60%)"
              radius={[0, 0, 4, 4]}
              maxBarSize={36}
            />
            <Bar
              dataKey="overtime"
              stackId="stack"
              fill="hsl(38 92% 50%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
