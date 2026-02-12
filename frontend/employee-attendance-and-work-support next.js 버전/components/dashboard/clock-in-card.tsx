"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, LogIn, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { checkIn, checkOut, fetchTodayAttendance } from "@/lib/api"
import { toast } from "sonner"

interface ClockInCardProps {
  onAttendanceUpdate?: () => void
}

export function ClockInCard({ onAttendanceUpdate }: ClockInCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendance, setAttendance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch today's attendance on mount
  const refreshAttendance = async () => {
    try {
      const data = await fetchTodayAttendance()
      setAttendance(data)
    } catch (error) {
      console.error("Failed to fetch today's attendance", error)
    }
  }

  useEffect(() => {
    refreshAttendance()
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      await checkIn()
      await refreshAttendance()
      onAttendanceUpdate?.()
      toast.success("출근 완료!")
    } catch (error) {
      toast.error("출근 처리 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      await checkOut()
      await refreshAttendance()
      onAttendanceUpdate?.()
      toast.success("퇴근 완료!")
    } catch (error) {
      toast.error("퇴근 처리 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate elapsed time
  let elapsedHours = 0
  let elapsedMinutes = 0
  let progress = 0

  if (attendance && attendance.checkInTime) {
    const checkInDate = new Date()
    const [hours, minutes] = attendance.checkInTime.split(':').map(Number)
    checkInDate.setHours(hours, minutes, 0, 0)

    const now = new Date()
    // If checked out, use checkOutTime to calculate final duration (optional, or just stick to current time if still working)
    // For simplicity in this card, if checked out, we might want to show total worked time. 
    // But the UI "Attendance Status" usually implies current status. 
    // If checked out, we usually stop the counter or show "Retire".

    let diff = now.getTime() - checkInDate.getTime()

    if (attendance.checkOutTime) {
      const [outHours, outMinutes] = attendance.checkOutTime.split(':').map(Number)
      const checkOutDate = new Date()
      checkOutDate.setHours(outHours, outMinutes, 0, 0)
      diff = checkOutDate.getTime() - checkInDate.getTime()
    }

    if (diff > 0) {
      elapsedHours = Math.floor(diff / (1000 * 60 * 60))
      elapsedMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      // Assumes 9 to 6 (9 hours = 540 mins) as standard work day for progress bar
      progress = Math.min(100, Math.round(((elapsedHours * 60 + elapsedMinutes) / 540) * 100))
    }
  }

  const timeStr = currentTime.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const dateStr = currentTime.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const isCheckedIn = attendance !== null
  const isCheckedOut = attendance?.checkOutTime !== null

  return (
    <Card className="col-span-full lg:col-span-1 overflow-hidden bg-[#1c1c1e] text-white border-0 dark:bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white">
          출퇴근 체크
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Current Time */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            현재 시각
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-white tracking-tight">
            {timeStr}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{dateStr}</p>
        </div>

        {/* Clock Status */}
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-zinc-800/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">
              {isCheckedIn
                ? `출근 시각: ${attendance.checkInTime ? attendance.checkInTime.substring(0, 5) : '-'}`
                : "출근 전입니다"}
            </p>
            <p className="text-xs text-zinc-400">
              {isCheckedIn
                ? `근무 ${elapsedHours}시간 ${elapsedMinutes}분 ${isCheckedOut ? ' (퇴근완료)' : '경과'}`
                : "오늘도 화이팅하세요!"}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>일일 근무 진행률</span>
            <span className="font-mono font-medium text-foreground">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>09:00</span>
            <span>18:00</span>
          </div>
        </div>

        {/* Action */}
        {!isCheckedIn ? (
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleCheckIn}
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            출근하기
          </Button>
        ) : !isCheckedOut ? (
          <Button
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleCheckOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            퇴근하기
          </Button>
        ) : (
          <Button
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            퇴근 완료
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
