"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, UserPlus, History, Key, Eye, Edit, Save, X } from "lucide-react"
import {
    adminFetchEmployees,
    adminRegisterEmployee,
    adminResetPassword,
    adminFetchEmployeeAttendance,
    adminUpdateEmployee,
    fetchDepartments,
    type AdminEmployee,
    type Attendance,
    type Department
} from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState<AdminEmployee[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Registration State
    const [isRegDialogOpen, setIsRegDialogOpen] = useState(false)
    const [newEmployee, setNewEmployee] = useState({
        employeeNo: "",
        name: "",
        departNo: 1,
        email: "",
        phone: "",
        position: "",
        joinDate: format(new Date(), "yyyy-MM-dd"),
    })

    // Detail/History State
    const [selectedEmployee, setSelectedEmployee] = useState<AdminEmployee | null>(null)
    const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        joinDate: "",
        departNo: 0
    })

    useEffect(() => {
        loadEmployees()
        loadDepartments()
    }, [])

    async function loadEmployees() {
        try {
            setLoading(true)
            const data = await adminFetchEmployees()
            setEmployees(data)
        } catch (error) {
            toast.error("사원 목록을 불러오는데 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    async function loadDepartments() {
        try {
            const data = await fetchDepartments()
            setDepartments(data)
            if (data.length > 0) {
                setNewEmployee(prev => ({ ...prev, departNo: data[0].departNo }))
            }
        } catch (error) {
            console.error("Failed to load departments", error)
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.includes(searchQuery) ||
        emp.employeeNo.includes(searchQuery) ||
        (emp.departmentName && emp.departmentName.includes(searchQuery))
    )

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        try {
            await adminRegisterEmployee(newEmployee)
            toast.success("사원이 등록되었습니다.")
            setIsRegDialogOpen(false)
            setNewEmployee({
                employeeNo: "",
                name: "",
                departNo: departments[0]?.departNo || 1,
                email: "",
                phone: "",
                position: "",
                joinDate: format(new Date(), "yyyy-MM-dd"),
            })
            loadEmployees()
        } catch (error: any) {
            toast.error(error.message || "등록 실패")
        }
    }

    async function handleResetPassword(userId: number) {
        if (!confirm("비밀번호를 초기화하시겠습니까? (1111로 초기화됩니다)")) return
        try {
            const msg = await adminResetPassword(userId)
            toast.success(msg)
        } catch (error) {
            toast.error("비밀번호 초기화 실패")
        }
    }

    async function handleViewDetail(employee: AdminEmployee) {
        setSelectedEmployee(employee)
        setIsEditMode(false)
        setEditForm({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            position: employee.position,
            joinDate: employee.joinDate,
            departNo: departments.find(d => d.departName === employee.departmentName)?.departNo || 1
        })
        try {
            const history = await adminFetchEmployeeAttendance(employee.employeeId)
            setAttendanceHistory(history)
            setIsDetailOpen(true)
        } catch (error) {
            toast.error("근태 이력을 불러오는데 실패했습니다.")
        }
    }

    async function handleUpdateEmployee() {
        if (!selectedEmployee) return
        try {
            await adminUpdateEmployee(selectedEmployee.employeeId, editForm)
            toast.success("사원 정보가 수정되었습니다.")
            setIsEditMode(false)
            loadEmployees() // Refresh list

            const updatedDeptName = departments.find(d => d.departNo === editForm.departNo)?.departName || selectedEmployee.departmentName
            setSelectedEmployee({
                ...selectedEmployee,
                ...editForm,
                departmentName: updatedDeptName
            })
        } catch (error: any) {
            toast.error(error.message || "수정 실패")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">사원 관리</h1>
                    <p className="text-muted-foreground">전체 사원 정보를 조회하고 관리합니다.</p>
                </div>
                <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            사원 등록
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleRegister}>
                            <DialogHeader>
                                <DialogTitle>사원 개별 등록</DialogTitle>
                                <DialogDescription>
                                    새로운 사원의 정보를 성실히 입력해주세요. 초기 비밀번호는 1111로 설정됩니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="employeeNo" className="text-right">사번</Label>
                                    <Input id="employeeNo" className="col-span-3" value={newEmployee.employeeNo} onChange={e => setNewEmployee({ ...newEmployee, employeeNo: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">이름</Label>
                                    <Input id="name" className="col-span-3" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="departNo" className="text-right">부서</Label>
                                    <Select
                                        value={newEmployee.departNo.toString()}
                                        onValueChange={val => setNewEmployee({ ...newEmployee, departNo: parseInt(val) })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="부서 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.departNo} value={dept.departNo.toString()}>{dept.departName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="position" className="text-right">직급</Label>
                                    <Input id="position" className="col-span-3" value={newEmployee.position} onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">이메일</Label>
                                    <Input id="email" type="email" className="col-span-3" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">연락처</Label>
                                    <Input id="phone" className="col-span-3" value={newEmployee.phone} onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="joinDate" className="text-right">입사일</Label>
                                    <Input id="joinDate" type="date" className="col-span-3" value={newEmployee.joinDate} onChange={e => setNewEmployee({ ...newEmployee, joinDate: e.target.value })} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">등록 완료</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>사원 목록</CardTitle>
                            <CardDescription>검색 및 상세 정보 조회가 가능합니다.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="사원명, 사번, 부서 검색..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>사번</TableHead>
                                <TableHead>이름</TableHead>
                                <TableHead>부서 / 직급</TableHead>
                                <TableHead>이메일</TableHead>
                                <TableHead>입사일</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">로딩 중...</TableCell>
                                </TableRow>
                            ) : filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">검색 결과가 없습니다.</TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <TableRow key={emp.employeeId}>
                                        <TableCell className="font-medium">{emp.employeeNo}</TableCell>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-primary">{emp.departmentName || "부서 미정"}</span>
                                                <span className="text-[11px] text-muted-foreground">{emp.position}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">{emp.email}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{emp.joinDate}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(emp)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700" onClick={() => handleResetPassword(emp.employeeId)}>
                                                    <Key className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail / Attendance History Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                {selectedEmployee?.name} {selectedEmployee?.position} 상세 정보
                            </DialogTitle>
                            <div className="flex items-center gap-2 mr-6">
                                {isEditMode ? (
                                    <>
                                        <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)} className="gap-1">
                                            <X className="h-3 w-3" /> 취소
                                        </Button>
                                        <Button size="sm" onClick={handleUpdateEmployee} className="gap-1">
                                            <Save className="h-3 w-3" /> 저장
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditMode(true)} className="gap-1">
                                        <Edit className="h-3 w-3" /> 수정
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">이름</Label>
                                {isEditMode ? (
                                    <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                ) : (
                                    <p className="font-semibold">{selectedEmployee?.name}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">사번</Label>
                                <p className="font-semibold text-muted-foreground">{selectedEmployee?.employeeNo} (수정 불가)</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">부서</Label>
                                {isEditMode ? (
                                    <Select
                                        value={editForm.departNo.toString()}
                                        onValueChange={val => setEditForm({ ...editForm, departNo: parseInt(val) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.departNo} value={dept.departNo.toString()}>{dept.departName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-semibold">{selectedEmployee?.departmentName || "부서 미정"}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">직급</Label>
                                {isEditMode ? (
                                    <Input value={editForm.position} onChange={e => setEditForm({ ...editForm, position: e.target.value })} />
                                ) : (
                                    <p className="font-semibold">{selectedEmployee?.position}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">이메일</Label>
                                {isEditMode ? (
                                    <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                ) : (
                                    <p className="font-semibold">{selectedEmployee?.email}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">연락처</Label>
                                {isEditMode ? (
                                    <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                ) : (
                                    <p className="font-semibold">{selectedEmployee?.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="flex items-center gap-2 font-bold mb-4">
                                <History className="h-4 w-4" /> 최근 근태 기록 (최근 10건)
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>날짜</TableHead>
                                        <TableHead>출근</TableHead>
                                        <TableHead>퇴근</TableHead>
                                        <TableHead>상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                                                기록이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attendanceHistory.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="text-xs">{record.workDate}</TableCell>
                                                <TableCell className="text-xs font-mono">{record.checkInTime || "--:--"}</TableCell>
                                                <TableCell className="text-xs font-mono">{record.checkOutTime || "--:--"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={record.statusCode === "NORMAL" ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0 h-4">
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
