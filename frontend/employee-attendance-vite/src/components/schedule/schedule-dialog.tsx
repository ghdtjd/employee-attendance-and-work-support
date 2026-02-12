"use client"

import { useState, useEffect } from "react"
import { type Task, type TaskCreateRequest, type TaskUpdateRequest, createTask, updateTask, deleteTask } from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { toast } from "sonner"

interface ScheduleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: Task | null // If present, we are editing
    onSuccess: () => void
    selectedDate?: Date
    user?: any // Pass current user info if needed
}

type ScheduleType = "TASK" | "VACATION" | "REMOTE"

export function ScheduleDialog({ open, onOpenChange, task, onSuccess, selectedDate, user }: ScheduleDialogProps) {
    const [loading, setLoading] = useState(false)

    // Form states
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState<string>("")
    const [status, setStatus] = useState<Task["status"]>("TODO")
    const [type, setType] = useState<ScheduleType>("TASK")

    // Reset form when dialog opens or task/selectedDate changes
    useEffect(() => {
        if (open) {
            let initialTitle = task?.title || ""
            let initialType: ScheduleType = "TASK"

            if (initialTitle.startsWith("[휴가]")) {
                initialType = "VACATION"
                initialTitle = initialTitle.replace("[휴가] ", "")
            } else if (initialTitle.startsWith("[재택]")) {
                initialType = "REMOTE"
                initialTitle = initialTitle.replace("[재택] ", "")
            }

            setTitle(initialTitle)
            setDescription(task?.description || "")
            setDueDate(task?.dueDate ? task.dueDate.split('T')[0] : selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
            setStatus(task?.status || "TODO")
            setType(initialType)
        }
    }, [open, task, selectedDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const finalTitle = type === "VACATION" ? `[휴가] ${title}` : type === "REMOTE" ? `[재택] ${title}` : title

            if (task) {
                const updateReq: TaskUpdateRequest = {
                    title: finalTitle,
                    description,
                    dueDate: dueDate || undefined,
                    status,
                }
                await updateTask(task.id, updateReq)
                toast.success("일정이 수정되었습니다.")
            } else {
                if (!user) {
                    toast.error("로그인 정보가 없습니다.")
                    setLoading(false)
                    return
                }
                const createReq: TaskCreateRequest = {
                    title: finalTitle,
                    description,
                    dueDate: dueDate || undefined,
                    employeeId: user.employeeId,
                    userId: user.id,
                }
                await createTask(createReq)
                toast.success(type === "TASK" ? "일정이 등록되었습니다." : "신청이 완료되었습니다.")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Submit error:", error)
            toast.error("처리에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!task) return
        if (!confirm("정말 삭제하시겠습니까?")) return

        setLoading(true)
        try {
            await deleteTask(task.id)
            toast.success("일정이 삭제되었습니다.")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("일정 삭제에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{task ? "일정 수정" : "일정 등록"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            유형
                        </Label>
                        <Select value={type} onValueChange={(val: ScheduleType) => setType(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TASK">일반 근무 / 일정</SelectItem>
                                <SelectItem value="VACATION">휴가 신청</SelectItem>
                                <SelectItem value="REMOTE">재택 근무 신청</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            제목
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder={type === "TASK" ? "업무 제목" : "신청 사유 간략히"}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            날짜
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {type === "TASK" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                상태
                            </Label>
                            <Select value={status} onValueChange={(val: Task["status"]) => setStatus(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="상태 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">할 일</SelectItem>
                                    <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                                    <SelectItem value="DONE">완료</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right mt-2">
                            설명
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                            rows={3}
                            placeholder="상세 내용을 입력하세요."
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        {task && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                                삭제
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                취소
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "처리 중..." : (task ? "수정" : "등록")}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
