import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import { fetchAttendance, type Attendance } from "@/lib/api"

const statusStyles = {
  NORMAL: "bg-accent/15 text-accent border-0",
  LATE: "bg-destructive/15 text-destructive border-0",
  ABSENT: "bg-destructive/15 text-destructive border-0",
  VACATION: "bg-primary/15 text-primary border-0",
  OVERTIME: "bg-chart-3/15 text-chart-3 border-0",
}

export function AttendanceTable() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttendance() {
      try {
        const data = await fetchAttendance()
        setRecords(data.slice(0, 5))
      } catch (err) {
        console.error("Failed to load attendance", err)
      } finally {
        setLoading(false)
      }
    }
    loadAttendance()
  }, [])

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">최근 출퇴근 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">
            최근 출퇴근 기록
          </CardTitle>
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            전체보기
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  날짜
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  출근
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  퇴근
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                  근무시간
                </th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={5} className="py-3 text-center text-sm text-muted-foreground">기록이 없습니다.</td></tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/50 last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="py-3 text-sm font-medium text-foreground">
                      {record.workDate}
                    </td>
                    <td className="py-3 font-mono text-sm text-foreground">
                      {record.checkInTime || "---"}
                    </td>
                    <td className="py-3 font-mono text-sm text-foreground">
                      {record.checkOutTime || "---"}
                    </td>
                    <td className="py-3 font-mono text-sm text-muted-foreground">
                      {record.workHours ? `${Math.floor(record.workHours)}h ${Math.round((record.workHours % 1) * 60)}m` : "---"}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        className={statusStyles[record.statusCode as keyof typeof statusStyles] || "bg-secondary text-secondary-foreground"}
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
