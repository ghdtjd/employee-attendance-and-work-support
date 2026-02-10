import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data removed as per request. Backend API for team status is not yet available.
const teamMembers: any[] = []

const statusDot: Record<string, string> = {
  "근무중": "bg-accent",
  "외출": "bg-chart-3",
  "회의중": "bg-chart-5",
  "휴가": "bg-muted-foreground",
}

export function TeamStatus() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          팀원 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {teamMembers.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {teamMembers.map((member) => (
              <li
                key={member.name}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`text-[10px] font-semibold ${member.color}`}>
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDot[member.status] ?? "bg-muted-foreground"}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {member.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            팀원 현황 정보가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
