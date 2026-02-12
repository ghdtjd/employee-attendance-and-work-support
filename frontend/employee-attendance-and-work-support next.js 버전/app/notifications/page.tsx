"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { useEffect, useState } from "react"
import { fetchBoards, Board } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Calendar, User } from "lucide-react"
import { NoticeDetailDialog } from "@/components/dashboard/notice-detail-dialog"

export default function NotificationsPage() {
    const [notices, setNotices] = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedNotice, setSelectedNotice] = useState<Board | null>(null)

    useEffect(() => {
        async function loadNotices() {
            try {
                const data = await fetchBoards()
                // Sort by createdAt desc
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                setNotices(data)
            } catch (error) {
                console.error("Failed to fetch notices", error)
            } finally {
                setLoading(false)
            }
        }
        loadNotices()
    }, [])

    return (
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[68px] lg:pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">공지사항</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>전체 공지 목록</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
                            ) : notices.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">등록된 공지사항이 없습니다.</div>
                            ) : (
                                <div className="space-y-4">
                                    {notices.map((notice) => {
                                        const date = new Date(notice.createdAt)
                                        const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

                                        // New logic: within 3 days
                                        const now = new Date()
                                        const diffTime = Math.abs(now.getTime() - date.getTime())
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                        const isNew = diffDays <= 3

                                        return (
                                            <div
                                                key={notice.id}
                                                onClick={() => setSelectedNotice(notice)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4 cursor-pointer"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 bg-primary/10 p-2 rounded-full hidden sm:block">
                                                        <Megaphone className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {isNew && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">NEW</Badge>}
                                                            <Badge variant={notice.importance === 'HIGH' ? "default" : "secondary"} className="text-xs">
                                                                {notice.importance === 'HIGH' ? '필독' : '공지'}
                                                            </Badge>
                                                            <h3 className="font-semibold text-base">{notice.title}</h3>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>

                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 sm:hidden">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {notice.authorName || '관리자'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {dateStr}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden sm:flex flex-col items-end gap-1 text-sm text-muted-foreground min-w-[100px]">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {notice.authorName || '관리자'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {dateStr}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            <NoticeDetailDialog
                notice={selectedNotice}
                open={!!selectedNotice}
                onOpenChange={(open) => !open && setSelectedNotice(null)}
            />
        </div>
    )
}
