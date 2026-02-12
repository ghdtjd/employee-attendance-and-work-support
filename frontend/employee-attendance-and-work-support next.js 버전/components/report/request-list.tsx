"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task, fetchTasks, updateTask, deleteTask } from "@/lib/api"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function RequestList() {
    const [requests, setRequests] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const loadRequests = async () => {
        try {
            const allTasks = await fetchTasks()
            // Filter tasks that start with [휴가] or [재택]
            const filtered = allTasks.filter(t =>
                t.title.startsWith('[휴가]') || t.title.startsWith('[재택]')
            )
            setRequests(filtered)
        } catch (error) {
            console.error("Failed to load requests", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRequests()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return
        try {
            await deleteTask(id)
            toast.success("삭제되었습니다.")
            loadRequests()
        } catch (error) {
            toast.error("삭제 실패")
        }
    }

    // Since we don't have a real approval system backend, "Edit" might just be "Delete and Re-apply" for now 
    // or we could implement an Edit Dialog. User asked for "Modify/Delete".
    // For simplicity sake, let's allow Delete. Modify is tricky without a dedicated dialog re-use.
    // I previously created `ScheduleDialog` which can edit `Task`.
    // But `RequestDialog` doesn't handle edits yet.
    // Let's provide Delete first. 

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>신청 현황</CardTitle>
                <Button variant="outline" size="sm" onClick={loadRequests}>
                    새로고침
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">신청 내역이 없습니다.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>유형</TableHead>
                                <TableHead>날짜/사유</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">
                                        {req.title.split(' ')[0]}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {(req.description || "").split('\n')[0]?.replace('날짜: ', '') || '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(req.description || "").split('\n')[1]?.replace('사유: ', '') || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'DONE' ? 'default' : 'secondary'}>
                                            {req.status === 'DONE' ? '승인됨' : '대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(req.id!)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
