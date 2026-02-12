
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    fetchTasks,
    deleteTask,
    fetchObjections,
    deleteObjection,
    adminFetchObjections,
    adminFetchRequests,
    adminApproveRequest,
    adminRejectRequest,
    adminUpdateObjectionStatus
} from "@/lib/api"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Trash2, X } from "lucide-react"
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

interface RequestItem {
    id: number
    type: 'TASK' | 'OBJECTION'
    employeeNo?: string
    employeeName?: string
    title: string
    description: string
    status: string
}

interface RequestListProps {
    isAdminMode?: boolean
}

export function RequestList({ isAdminMode = false }: RequestListProps) {
    const [requests, setRequests] = useState<RequestItem[]>([])
    const [loading, setLoading] = useState(true)

    const loadRequests = async () => {
        setLoading(true)
        try {
            if (isAdminMode) {
                const [adminTasks, adminObjections] = await Promise.all([
                    adminFetchRequests(),
                    adminFetchObjections()
                ])

                const taskItems: RequestItem[] = adminTasks.map(t => ({
                    id: t.id,
                    type: 'TASK',
                    employeeNo: t.employeeNo,
                    employeeName: t.employeeName,
                    title: t.title,
                    description: t.description,
                    status: t.status
                }))

                const objectionItems: RequestItem[] = adminObjections.map(o => ({
                    id: o.id,
                    type: 'OBJECTION',
                    employeeNo: o.employeeNo,
                    employeeName: o.employeeName,
                    title: o.title,
                    description: o.description,
                    status: o.status
                }))

                setRequests([...taskItems, ...objectionItems].sort((a, b) => b.id - a.id))
            } else {
                const [userTasks, userObjections] = await Promise.all([
                    fetchTasks(),
                    fetchObjections()
                ])

                const taskItems: RequestItem[] = userTasks
                    .filter(t => t.title.startsWith('[휴가]') || t.title.startsWith('[재택]'))
                    .map(t => ({
                        id: t.id,
                        type: 'TASK',
                        title: t.title,
                        description: t.description || '',
                        status: t.status
                    }))

                const objectionItems: RequestItem[] = userObjections.map(o => ({
                    id: o.id,
                    type: 'OBJECTION',
                    title: '[이의신청] ' + o.category,
                    description: `날짜: ${o.attendanceDate}\n사유: ${o.reason}`,
                    status: o.status
                }))

                setRequests([...taskItems, ...objectionItems].sort((a, b) => b.id - a.id))
            }
        } catch (error) {
            console.error("Failed to load requests", error)
            toast.error("요청 목록을 불러오는데 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRequests()
    }, [isAdminMode])

    const handleDelete = async (id: number, type: 'TASK' | 'OBJECTION') => {
        if (!confirm("정말 삭제하시겠습니까?")) return
        try {
            if (type === 'TASK') {
                await deleteTask(id)
            } else {
                await deleteObjection(id)
            }
            toast.success("삭제되었습니다.")
            loadRequests()
        } catch (error) {
            toast.error("삭제 실패")
        }
    }

    const handleApprove = async (id: number, type: 'TASK' | 'OBJECTION') => {
        try {
            if (type === 'TASK') {
                await adminApproveRequest(id)
            } else {
                await adminUpdateObjectionStatus(id, 'APPROVED')
            }
            toast.success("승인되었습니다.")
            loadRequests()
        } catch (error) {
            toast.error("승인 실패")
        }
    }

    const handleReject = async (id: number, type: 'TASK' | 'OBJECTION') => {
        try {
            if (type === 'TASK') {
                await adminRejectRequest(id)
            } else {
                await adminUpdateObjectionStatus(id, 'REJECTED')
            }
            toast.success("거절되었습니다.")
            loadRequests()
        } catch (error) {
            toast.error("거절 실패")
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED': return '승인됨'
            case 'DONE': return '승인됨'
            case 'REJECTED': return '거절됨'
            case 'PENDING': return '대기중'
            case 'TODO': return '대기중'
            default: return status
        }
    }

    const getStatusVariant = (status: string) => {
        if (status === 'APPROVED' || status === 'DONE') return 'default'
        if (status === 'REJECTED') return 'destructive'
        return 'secondary'
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{isAdminMode ? "관리자 신청 관리" : "신청 현황"}</CardTitle>
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
                                {isAdminMode && <TableHead>사원 정보</TableHead>}
                                <TableHead>유형</TableHead>
                                <TableHead>날짜/사유</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={`${req.type}-${req.id}`}>
                                    {isAdminMode && (
                                        <TableCell>
                                            <div className="font-medium">{req.employeeName}</div>
                                            <div className="text-xs text-muted-foreground">{req.employeeNo}</div>
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">
                                        {req.title.split(' ')[0]} <span className="text-sm font-normal text-muted-foreground">{req.title.split(' ')[1]}</span>
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
                                        <Badge variant={getStatusVariant(req.status)}>
                                            {getStatusLabel(req.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {isAdminMode && (req.status === 'PENDING' || req.status === 'TODO' || req.status === 'IN_PROGRESS') ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleApprove(req.id, req.type)}
                                                        className="text-primary hover:text-primary/90 h-8 w-8"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleReject(req.id, req.type)}
                                                        className="text-destructive hover:text-destructive/90 h-8 w-8"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : !isAdminMode && (req.status === 'PENDING' || req.status === 'TODO') ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(req.id, req.type)}
                                                    className="text-destructive hover:text-destructive/90 h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : null}
                                        </div>
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
