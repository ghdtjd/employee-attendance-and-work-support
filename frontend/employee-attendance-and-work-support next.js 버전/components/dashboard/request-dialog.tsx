"use client"

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
import { useState } from "react"
import { toast } from "sonner"
import { createTask } from "@/lib/api"
import { format } from "date-fns"

interface RequestDialogProps {
    type: "LEAVE" | "REMOTE" | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    user?: any
}

export function RequestDialog({ type, open, onOpenChange, onSuccess, user }: RequestDialogProps) {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    const titlePrefix = type === 'LEAVE' ? '[휴가]' : '[재택]'
    const titleLabel = type === 'LEAVE' ? '휴가 신청' : '재택근무 신청'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("로그인 정보가 없습니다.")
            return
        }
        setLoading(true)

        try {
            await createTask({
                title: `${titlePrefix} ${titleLabel}`,
                description: `날짜: ${date}\n사유: ${reason}`,
                dueDate: date + "T18:00:00", // Using 6PM as default due time
                employeeId: user.employeeId,
                userId: user.id
            })
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
                        {type === 'LEAVE' ? '연차 또는 반차를 신청합니다.' : '원격 근무를 신청합니다.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">날짜</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="block w-full text-foreground bg-background dark:[color-scheme:dark]"
                        />
                    </div>
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
