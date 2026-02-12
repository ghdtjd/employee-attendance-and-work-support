"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"

export function DashboardHeader() {
  const { user } = useAuth()
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">대시보드</h1>
        <Badge className="border-0 bg-accent/15 text-accent text-xs font-medium">
          근무중
        </Badge>
      </div>

      {/* Icons Removed */}

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {user?.name ? user.name.slice(0, 2) : "User"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-foreground leading-none">
            {user?.name || "사용자"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {user?.department || "부서미정"} / {user?.position || "직급미정"}
          </p>
        </div>
      </div>
    </header>
  )
}
