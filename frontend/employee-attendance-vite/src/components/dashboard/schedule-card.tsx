import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users, AlertCircle } from "lucide-react"
import { fetchTasks, fetchRequests, type Task, type AttendanceRequest } from "@/lib/api"
import { format, isSameDay, parseISO, isWithinInterval, startOfDay } from "date-fns"

const typeIcons: Record<string, any> = {
  TODO: CalendarDays,
  IN_PROGRESS: Clock,
  DONE: Users,
  PENDING: AlertCircle,
}

const typeStyles: Record<string, string> = {
  TODO: "border-l-primary bg-primary/5",
  IN_PROGRESS: "border-l-accent bg-accent/5",
  DONE: "border-l-chart-3 bg-chart-3/5",
  PENDING: "border-l-destructive bg-destructive/5",
}

export function ScheduleCard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [requests, setRequests] = useState<AttendanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, requestData] = await Promise.all([
          fetchTasks(),
          fetchRequests()
        ])
        const today = new Date()

        // Filter tasks for Today's Schedule
        const todaysTasks = taskData.filter(task => {
          // Exclude legacy Requests in tasks (if any still exist)
          if (task.title.startsWith("[휴가]") || task.title.startsWith("[재택]")) return false

          const taskDate = task.dueDate ? parseISO(task.dueDate) : parseISO(task.createdAt)

          // If it has a due date, show if due today
          if (task.dueDate) {
            return isSameDay(taskDate, today)
          }

          // If it's in progress, show it
          if (task.status === 'IN_PROGRESS') {
            return true;
          }

          // Otherwise show if created today
          return isSameDay(taskDate, today)
        })

        // Sort: IN_PROGRESS first, then by time
        todaysTasks.sort((a, b) => {
          if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
          if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })

        const todaysRequests = requestData.filter(wr => {
          const start = startOfDay(parseISO(wr.startDate))
          const end = startOfDay(parseISO(wr.endDate))
          const current = startOfDay(today)
          return isWithinInterval(current, { start, end })
        })

        setTasks(todaysTasks)
        setRequests(todaysRequests)
      } catch (err) {
        console.error("Failed to load tasks", err)
        setError("일정을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            오늘 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">로딩 중...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            오늘 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[150px] items-center justify-center text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-none">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-lg font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate('/schedule')}
          >
            오늘 일정
          </CardTitle>
          <span className="text-xs text-muted-foreground">{tasks.length + requests.length}건</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto min-h-[220px] max-h-[220px]">
        <div className="flex flex-col gap-3">
          {tasks.length === 0 && requests.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">등록된 일정이 없습니다.</div>
          ) : (
            <>
              {requests.map((wr) => (
                <div
                  key={`wr-${wr.id}`}
                  className="flex items-start gap-3 rounded-lg border-l-4 border-l-primary bg-primary/5 p-3 transition-colors hover:brightness-105"
                >
                  <div className="mt-0.5 relative">
                    <CalendarDays className="h-4 w-4 text-primary opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary line-clamp-1">
                      [{wr.type === 'LEAVE' ? '휴가' : '재택'}] {wr.type === 'LEAVE' ? '휴가 신청' : '재택근무 신청'}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary/80">
                        <Clock className="h-3 w-3" />
                        {wr.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.map((task) => {
                const Icon = typeIcons[task.status] || CalendarDays
                const statusStyle = typeStyles[task.status] || "border-l-gray-300 bg-gray-50"
                const timeString = task.createdAt ? format(parseISO(task.createdAt), "HH:mm") : "--:--"
                const dueDateString = task.dueDate ? format(parseISO(task.dueDate), "MM/dd") : null

                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 rounded-lg border-l-4 p-3 transition-colors hover:brightness-105 ${statusStyle}`}
                  >
                    <div className="mt-0.5 relative">
                      <Icon className="h-4 w-4 text-muted-foreground opacity-70" />
                      {task.status === 'IN_PROGRESS' && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary/80">
                            <CalendarDays className="h-3 w-3" />
                            {dueDateString}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeString}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
