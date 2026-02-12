"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Board } from "@/lib/api"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface NoticeDetailDialogProps {
    notice: Board | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NoticeDetailDialog({ notice, open, onOpenChange }: NoticeDetailDialogProps) {
    if (!notice) return null

    const date = new Date(notice.createdAt)
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={notice.importance === 'HIGH' ? 'destructive' : 'secondary'}>
                            {notice.importance === 'HIGH' ? '필독' : '공지'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{dateStr}</span>
                    </div>
                    <DialogTitle className="text-xl">{notice.title}</DialogTitle>
                    <DialogDescription>
                        작성자: {notice.authorName || '관리자'}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap leading-relaxed">
                        {notice.content}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
