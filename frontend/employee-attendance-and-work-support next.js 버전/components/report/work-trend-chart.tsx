"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Attendance } from "@/lib/api"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"
import { format, parseISO } from "date-fns"

interface WorkTrendChartProps {
    data: Attendance[]
}

function CustomTooltip({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ value: number; name: string; color: string }>
    label?: string
}) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
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

export function WorkTrendChart({ data }: WorkTrendChartProps) {
    const chartData = data
        .filter(a => a.workHours !== null)
        .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime())
        .map(a => {
            const totalHours = a.workHours || 0
            const regular = Math.min(totalHours, 8)
            const overtime = Math.max(0, totalHours - 8)
            return {
                date: format(parseISO(a.workDate), "d일"),
                hours: Number(regular.toFixed(1)),
                overtime: Number(overtime.toFixed(1))
            }
        })

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">
                        일별 근무 시간
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
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(240 4% 16%)"
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "hsl(240 4% 55%)" }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "hsl(240 4% 55%)" }}
                                tickFormatter={(value) => `${value}h`}
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
                </div>
            </CardContent>
        </Card>
    )
}
