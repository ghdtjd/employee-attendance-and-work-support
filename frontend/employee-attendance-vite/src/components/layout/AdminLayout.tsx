import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { useEffect } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate("/login")
            } else if (user.role !== "ADMIN") {
                navigate("/")
            }
        }
    }, [user, isLoading, navigate])

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!user || user.role !== "ADMIN") {
        return null
    }

    return (
        <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-[1400px] p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
