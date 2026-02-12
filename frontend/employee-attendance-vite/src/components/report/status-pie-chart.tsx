"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Attendance } from "@/lib/api"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useMemo } from "react"

interface StatusPieChartProps {
    data: Attendance[]
}

const COLORS = {
    NORMAL: "hsl(var(--chart-1))",
    LATE: "hsl(var(--chart-2))",
    VACATION: "hsl(var(--chart-3))",
    ABSENT: "hsl(var(--chart-4))",
    OVERTIME: "hsl(var(--chart-5))",
    EARLY_LEAVE: "hsl(var(--chart-2))", // Use same as LATE or distinct if available
}

const STATUS_LABELS: Record<string, string> = {
    NORMAL: "정상 출근",
    LATE: "지각",
    VACATION: "휴가",
    ABSENT: "결근",
    OVERTIME: "연장 근무",
    EARLY_LEAVE: "조퇴",
}

export function StatusPieChart({ data }: StatusPieChartProps) {
    const chartData = useMemo(() => {
        const counts: Record<string, number> = {}

        data.forEach(a => {
            const status = a.statusCode || "NORMAL" // default
            counts[status] = (counts[status] || 0) + 1
        })

        return Object.entries(counts).map(([key, value]) => ({
            name: STATUS_LABELS[key] || key,
            value,
            color: COLORS[key as keyof typeof COLORS] || "#8884d8"
        }))
    }, [data])

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>근태 상태 비율</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
