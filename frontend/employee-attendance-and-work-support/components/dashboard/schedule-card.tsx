import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, MapPin, Users, AlertCircle } from "lucide-react"
import { fetchTasks, Task } from "@/lib/api"
import { format, isSameDay, parseISO } from "date-fns"

const typeIcons = {
  TODO: CalendarDays,
  IN_PROGRESS: Clock,
  DONE: Users,
  PENDING: AlertCircle,
}

const typeStyles = {
  TODO: "border-l-primary bg-primary/5",
  IN_PROGRESS: "border-l-accent bg-accent/5",
  DONE: "border-l-chart-3 bg-chart-3/5",
  PENDING: "border-l-destructive bg-destructive/5",
}

export function ScheduleCard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await fetchTasks()
        const today = new Date()

        // Filter tasks for Today's Schedule
        // Criteria: 
        // 1. Due Date is Today OR
        // 2. Created Today (if no due date) OR
        // 3. Status is IN_PROGRESS (show regardless of date to track ongoing work)
        const todaysTasks = data.filter(task => {
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

        setTasks(todaysTasks)
      } catch (err) {
        console.error("Failed to load tasks", err)
        setError("일정을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
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
          <CardTitle className="text-sm font-medium text-foreground">
            오늘 일정
          </CardTitle>
          <span className="text-xs text-muted-foreground">{tasks.length}건</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto min-h-[220px] max-h-[220px]">
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-10">등록된 일정이 없습니다.</div>
          ) : (
            tasks.map((task) => {
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
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
