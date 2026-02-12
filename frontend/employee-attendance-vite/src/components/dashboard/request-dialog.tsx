
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { createTask, createObjection, createRequest } from "@/lib/api"
import { format } from "date-fns"

interface RequestDialogProps {
    type: "LEAVE" | "REMOTE" | "OBJECTION" | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    user?: any
}

export function RequestDialog({ type, open, onOpenChange, onSuccess, user }: RequestDialogProps) {
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [reason, setReason] = useState("")
    const [category, setCategory] = useState("출근누락")
    const [loading, setLoading] = useState(false)

    const titleLabel = type === 'LEAVE' ? '휴가 신청' : type === 'REMOTE' ? '재택근무 신청' : '근태 이의신청'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("로그인 정보가 없습니다.")
            return
        }

        // Basic validation for range
        if ((type === 'LEAVE' || type === 'REMOTE') && startDate > endDate) {
            toast.error("시작일은 종료일보다 빨라야 합니다.")
            return
        }

        setLoading(true)

        try {
            if (type === 'OBJECTION') {
                await createObjection({
                    attendanceDate: startDate,
                    category,
                    reason,
                })
            } else if (type === 'LEAVE' || type === 'REMOTE') {
                await createRequest({
                    type: type,
                    startDate: startDate,
                    endDate: endDate,
                    reason,
                })
            } else {
                await createTask({
                    title: `신청: ${titleLabel}`,
                    description: `기간: ${startDate} ~ ${endDate}\n사유: ${reason}`,
                    dueDate: startDate + "T18:00:00",
                    employeeId: user.employeeId,
                    userId: user.id
                })
            }
            toast.success("신청되었습니다.")
            onOpenChange(false)
            setReason("")
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("신청에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{titleLabel}</DialogTitle>
                    <DialogDescription>
                        {type === 'LEAVE' ? '연차 또는 반차를 신청합니다.' :
                            type === 'REMOTE' ? '원격 근무를 신청합니다.' :
                                '잘못된 근태 기록에 대한 수정을 요청합니다.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">
                                {type === 'OBJECTION' ? '대상 날짜' : '시작일'}
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value)
                                    // Automatically set end date if it's currently earlier or same as old start date
                                    if (endDate < e.target.value) {
                                        setEndDate(e.target.value)
                                    }
                                }}
                                required
                                className="block w-full text-foreground bg-background dark:[color-scheme:dark]"
                            />
                        </div>

                        {(type === 'LEAVE' || type === 'REMOTE') && (
                            <div className="grid gap-2">
                                <Label htmlFor="endDate">종료일</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    min={startDate}
                                    className="block w-full text-foreground bg-background dark:[color-scheme:dark]"
                                />
                            </div>
                        )}
                    </div>

                    {type === 'OBJECTION' && (
                        <div className="grid gap-2">
                            <Label htmlFor="category">유형</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="출근누락">출근누락</SelectItem>
                                    <SelectItem value="퇴근누락">퇴근누락</SelectItem>
                                    <SelectItem value="근무시간오류">근무시간오류</SelectItem>
                                    <SelectItem value="기타">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="reason">사유</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="신청 사유를 입력하세요"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "신청 중..." : "신청하기"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
