"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { adminFetchDashboardStats, type AdminDashboardStats } from "@/lib/api"
import { toast } from "sonner"
import { RequestList } from "@/components/report/request-list"

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                setLoading(true)
                const data = await adminFetchDashboardStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to load dashboard stats", error)
                toast.error("통계 정보를 불러오는데 실패했습니다.")
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
                <p className="text-muted-foreground">WorkHub의 전반적인 현황을 관리합니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">전체 사원</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "--" : stats?.totalEmployees} 명</div>
                        <p className="text-xs text-muted-foreground">현재 재직 중인 사원 수</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">오늘 출근</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "--" : stats?.todayAttendanceCount} 명</div>
                        <p className="text-xs text-muted-foreground">전체 사원 중 출근 비율: {loading ? "--" : stats?.attendanceRate}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">처리 대기</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "--" : stats?.pendingCorrectionsCount} 건</div>
                        <p className="text-xs text-muted-foreground">승인 대기 중인 근태/휴가 신청</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle className="text-lg">결재 대기 목록</CardTitle>
                                <CardDescription>사원들이 신청한 휴가, 재택 및 근태 정정 요청을 관리합니다.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RequestList isAdminMode={true} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
