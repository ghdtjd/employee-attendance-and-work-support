"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { useState, useEffect } from "react"
import { checkLogin, User, updateUserInfo, changePassword } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Info Form State
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [infoLoading, setInfoLoading] = useState(false)

    // Password Form State
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwdLoading, setPwdLoading] = useState(false)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await checkLogin()
                setUser(userData)
                setEmail(userData.email || "")
                setPhone(userData.phone || "")
            } catch (error) {
                console.error(error)
                toast.error("사용자 정보를 불러오는데 실패했습니다.")
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setInfoLoading(true)
        try {
            await updateUserInfo({ email, phone })
            toast.success("정보가 수정되었습니다.")
        } catch (error: any) {
            toast.error(error.message || "정보 수정 실패")
        } finally {
            setInfoLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("새 비밀번호가 일치하지 않습니다.")
            return
        }
        if (newPassword.length < 4) {
            toast.error("비밀번호는 4자 이상이어야 합니다.")
            return
        }

        setPwdLoading(true)
        try {
            await changePassword({ oldPassword, newPassword })
            toast.success("비밀번호가 변경되었습니다.")
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast.error(error.message || "비밀번호 변경 실패")
        } finally {
            setPwdLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                로딩 중...
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex flex-1 flex-col pl-[68px] lg:pl-[240px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
                        <p className="text-muted-foreground">
                            개인 정보 및 계정을 관리하세요.
                        </p>
                    </div>

                    <Tabs defaultValue="account" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="account">내 정보</TabsTrigger>
                            <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
                        </TabsList>

                        <TabsContent value="account">
                            <Card>
                                <CardHeader>
                                    <CardTitle>내 정보 수정</CardTitle>
                                    <CardDescription>
                                        이메일과 전화번호를 수정할 수 있습니다.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleInfoSubmit}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1">
                                            <Label>사번 (아이디)</Label>
                                            <Input value={user?.employeeNo} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>이름</Label>
                                            <Input value={user?.name} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>부서</Label>
                                            <Input value={user?.department} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="email">이메일</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="example@company.com"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="phone">전화번호</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={infoLoading}>
                                            {infoLoading ? "저장 중..." : "저장"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>비밀번호 변경</CardTitle>
                                    <CardDescription>
                                        계정 보호를 위해 정기적으로 비밀번호를 변경해주세요.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handlePasswordSubmit}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="oldPassword">현재 비밀번호</Label>
                                            <Input
                                                id="oldPassword"
                                                type="password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="newPassword">새 비밀번호</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={pwdLoading}>
                                            {pwdLoading ? "변경 중..." : "비밀번호 변경"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    )
}
