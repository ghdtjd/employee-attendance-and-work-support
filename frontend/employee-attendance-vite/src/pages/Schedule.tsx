import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState, useRef, useCallback } from "react"
import { fetchTasks, checkLogin, type Task, type User } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format, isSameDay, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { ScheduleDialog } from "@/components/schedule/schedule-dialog"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SchedulePage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [user, setUser] = useState<User | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    // 다이얼로그가 닫힌 직후 캘린더 클릭 이벤트가 전파되는 것을 방지
    const dialogJustClosedRef = useRef(false)

    // Debug: Log when date changes
    useEffect(() => {
        console.log("=== Schedule.tsx date changed ===", date)
    }, [date])

    // 다이얼로그가 닫히고 있을 때 캘린더 클릭을 무시하는 핸들러
    const handleDateSelect = useCallback((newDate: Date | undefined) => {
        if (dialogJustClosedRef.current) {
            console.log("=== Calendar click ignored (dialog just closed) ===")
            return
        }
        setDate(newDate)
    }, [])

    // Load User & Tasks
    const loadData = async () => {
        setLoading(true)
        try {
            // Check login first to get user info for creating tasks
            const userData = await checkLogin()
            setUser(userData)

            const taskData = await fetchTasks()
            setTasks(taskData)
        } catch (error) {
            console.error("Failed to load data", error)
            toast.error("일정을 불러오는데 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Filter tasks for selected date
    const filteredTasks = tasks.filter(task => {
        // Exclude Requests (Leave/Remote)
        if (task.title.startsWith("[휴가]") || task.title.startsWith("[재택]")) return false

        if (!date) return true
        if (task.dueDate) {
            return isSameDay(parseISO(task.dueDate), date)
        }
        return isSameDay(parseISO(task.createdAt), date)
    })

    // Filter tasks for selected MONTH
    const filteredMonthlyTasks = tasks.filter(task => {
        // Exclude Requests (Leave/Remote)
        if (task.title.startsWith("[휴가]") || task.title.startsWith("[재택]")) return false

        if (!date) return true
        const taskDate = task.dueDate ? parseISO(task.dueDate) : parseISO(task.createdAt)
        return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear()
    })

    const handleAddTask = () => {
        setSelectedTask(null)
        setDialogOpen(true)
    }

    const handleEditTask = (task: Task) => {
        setSelectedTask(task)
        setDialogOpen(true)
    }

    // 다이얼로그 열림/닫힘 관리 - 닫힐 때 클릭 전파 방지
    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            // 다이얼로그가 닫히는 순간 가드 활성화
            dialogJustClosedRef.current = true
            // 300ms 후 가드 해제 (클릭 이벤트 전파가 완료된 후)
            setTimeout(() => {
                dialogJustClosedRef.current = false
            }, 300)
        }
        setDialogOpen(open)
    }

    const handleSuccess = () => {
        loadData() // Refresh list
    }

    return (
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[68px] lg:pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">근무 일정</h1>
                        <Button onClick={handleAddTask}>
                            <Plus className="mr-2 h-4 w-4" />
                            일정 추가
                        </Button>
                    </div>

                    <div className="h-full">
                        <Tabs defaultValue="daily" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="daily">일별 일정</TabsTrigger>
                                <TabsTrigger value="monthly">월별 전체 일정</TabsTrigger>
                            </TabsList>

                            <TabsContent value="daily" className="flex-1 mt-0">
                                <div className="grid gap-6 md:grid-cols-[auto_1fr] h-full">
                                    <div className="h-fit">
                                        <Card>
                                            <CardContent className="p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={handleDateSelect}
                                                    className="rounded-md border shadow"
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle>
                                                {date ? format(date, "M월 d일 (EEE)", { locale: ko }) : "전체"} 일정
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                                            ) : filteredTasks.length === 0 ? (
                                                <div className="text-center py-10 text-muted-foreground">등록된 일정이 없습니다.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {filteredTasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleEditTask(task)}
                                                            className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <h3 className="font-medium leading-none">{task.title}</h3>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {task.description || "설명 없음"}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded">
                                                                {task.status}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="monthly" className="flex-1 mt-0 h-full">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>
                                            {date ? format(date, "M월", { locale: ko }) : "전체"} 전체 일정
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="overflow-y-auto max-h-[600px]">
                                        {loading ? (
                                            <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                                        ) : filteredMonthlyTasks.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">이번 달 일정이 없습니다.</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {filteredMonthlyTasks.sort((a, b) => (a.dueDate || a.createdAt).localeCompare(b.dueDate || b.createdAt)).map((task) => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleEditTask(task)}
                                                        className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-primary border px-1 rounded bg-primary/10">
                                                                    {format(parseISO(task.dueDate || task.createdAt), "d일")}
                                                                </span>
                                                                <h3 className="font-medium leading-none">{task.title}</h3>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {task.description || "설명 없음"}
                                                            </p>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded">
                                                            {task.status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            <ScheduleDialog
                open={dialogOpen}
                onOpenChange={handleDialogOpenChange}
                task={selectedTask}
                onSuccess={handleSuccess}
                selectedDate={date}
                user={user}
            />
        </div>
    )
}
