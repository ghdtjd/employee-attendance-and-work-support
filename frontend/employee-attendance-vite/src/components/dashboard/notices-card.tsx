import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Megaphone } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchBoards, type Board } from "@/lib/api"
import { NoticeDetailDialog } from "./notice-detail-dialog"

export function NoticesCard() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotice, setSelectedNotice] = useState<Board | null>(null)

  useEffect(() => {
    async function loadNotices() {
      try {
        const data = await fetchBoards()
        // Sort by id desc (newest first) or createdAt if available
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setNotices(data.slice(0, 5)) // Show only top 5
      } catch (error) {
        console.error("Failed to fetch notices", error)
      } finally {
        setLoading(false)
      }
    }
    loadNotices()
  }, [])

  return (
    <>
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold text-foreground">
                공지사항
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              전체보기
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">등록된 공지사항이 없습니다.</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {notices.map((notice) => {
                const date = new Date(notice.createdAt)
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

                // New logic: within 3 days
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - date.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                const isNew = diffDays <= 3

                return (
                  <li
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-secondary/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {notice.importance === 'HIGH' ? (
                        <Badge className="h-5 bg-primary text-primary-foreground border-0 px-2 text-[10px] font-bold shrink-0">
                          필독
                        </Badge>
                      ) : isNew && (
                        <Badge className="h-4 bg-destructive/15 text-destructive border-0 px-1 text-[10px] font-bold shrink-0">
                          N
                        </Badge>
                      )}

                      <span className="text-sm text-foreground truncate">
                        {notice.title}
                      </span>
                    </div>
                    <span className="ml-4 text-xs text-muted-foreground shrink-0">
                      {dateStr}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <NoticeDetailDialog
        notice={selectedNotice}
        open={!!selectedNotice}
        onOpenChange={(open) => !open && setSelectedNotice(null)}
      />
    </>
  )
}
