import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  PlaneTakeoff,
  ClipboardList,
  MessageSquare,
} from "lucide-react"

const actions = [
  {
    icon: PlaneTakeoff,
    label: "휴가 신청",
    description: "연차/반차 신청",
    color: "text-primary bg-primary/10 group-hover:bg-primary/20",
  },
  {
    icon: FileText,
    label: "초과근무 신청",
    description: "연장 근무 승인 요청",
    color: "text-chart-3 bg-chart-3/10 group-hover:bg-chart-3/20",
  },
  {
    icon: ClipboardList,
    label: "재택근무 신청",
    description: "원격 근무 요청",
    color: "text-accent bg-accent/10 group-hover:bg-accent/20",
  },
  {
    icon: MessageSquare,
    label: "근태 이의신청",
    description: "기록 수정 요청",
    color: "text-chart-5 bg-chart-5/10 group-hover:bg-chart-5/20",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          빠른 실행
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:bg-secondary/50"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">
                  {action.label}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
