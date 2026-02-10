"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
    const [employeeNo, setEmployeeNo] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(employeeNo, password);
            toast.success("로그인 성공!");
        } catch (error) {
            toast.error("로그인 실패: 사번과 비밀번호를 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">WorkSync 로그인</CardTitle>
                    <CardDescription className="text-center">
                        사번과 비밀번호를 입력하여 로그인하세요.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeNo">사번</Label>
                            <Input
                                id="employeeNo"
                                type="text"
                                placeholder="사번을 입력하세요"
                                value={employeeNo}
                                onChange={(e) => setEmployeeNo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "로그인 중..." : "로그인"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
