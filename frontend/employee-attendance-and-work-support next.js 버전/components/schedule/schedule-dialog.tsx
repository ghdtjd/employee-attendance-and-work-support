"use client"

import { useState } from "react"
import { Task, TaskCreateRequest, TaskUpdateRequest, createTask, updateTask, deleteTask } from "@/lib/api"
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

export function ScheduleDialog({ open, onOpenChange, task, onSuccess, selectedDate, user }: ScheduleDialogProps) {
    const [loading, setLoading] = useState(false)

    // Form states
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [dueDate, setDueDate] = useState<string>(
        task?.dueDate ? task.dueDate.split('T')[0] :
            selectedDate ? format(selectedDate, "yyyy-MM-dd") :
                format(new Date(), "yyyy-MM-dd")
    )
    const [status, setStatus] = useState<Task["status"]>(task?.status || "TODO")

    // Reset form when task changes
    useState(() => {
        if (open) {
            setTitle(task?.title || "")
            setDescription(task?.description || "")
            setDueDate(
                task?.dueDate ? task.dueDate.split('T')[0] :
                    selectedDate ? format(selectedDate, "yyyy-MM-dd") :
                        format(new Date(), "yyyy-MM-dd")
            )
            setStatus(task?.status || "TODO")
        }
    })

    // Since useState with initializer runs only once, we need logic to update state when props change while dialog is open (or re-opened)
    // Actually, using key on Dialog or useEffect is better. Let's use useEffect.
    // BUT, to keep it simple, I'll rely on the parent to unmount/remount or just use useEffect here.

    // Better approach:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (task) {
                // Update
                const updateReq: TaskUpdateRequest = {
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    status,
                }
                await updateTask(task.id, updateReq)
                toast.success("일정이 수정되었습니다.")
            } else {
                // Create
                if (!user) {
                    toast.error("로그인 정보가 없습니다.")
                    return
                }
                const createReq: TaskCreateRequest = {
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    employeeId: user.employeeId, // Assuming user object has these
                    userId: user.id,
                }
                await createTask(createReq)
                toast.success("일정이 등록되었습니다.")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error(task ? "일정 수정에 실패했습니다." : "일정 등록에 실패했습니다.")
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
                        <Label htmlFor="title" className="text-right">
                            제목
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
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
                        />
                    </div>
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
                                <SelectItem value="PENDING">보류</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
