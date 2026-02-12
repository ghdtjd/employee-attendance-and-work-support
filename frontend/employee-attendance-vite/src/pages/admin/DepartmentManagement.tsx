"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, Plus, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { fetchDepartments, adminCreateDepartment, adminUpdateDepartment, adminDeleteDepartment, type Department } from "@/lib/api"
import { toast } from "sonner"

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Department | null>(null)

    // Form state
    const [formData, setFormData] = useState<Partial<Department>>({
        departName: "",
        departTel: "",
        departMail: "",
        departLocation: ""
    })

    useEffect(() => {
        loadDepartments()
    }, [])

    async function loadDepartments() {
        try {
            setLoading(true)
            const data = await fetchDepartments()
            setDepartments(data)
        } catch (error) {
            toast.error("부서 목록을 불러오는데 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            departName: "",
            departTel: "",
            departMail: "",
            departLocation: ""
        })
        setEditingDept(null)
    }

    const handleOpenCreate = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (dept: Department) => {
        setEditingDept(dept)
        setFormData({
            departName: dept.departName,
            departTel: dept.departTel,
            departMail: dept.departMail,
            departLocation: dept.departLocation
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingDept) {
                await adminUpdateDepartment(editingDept.departNo, formData)
                toast.success("부서 정보가 수정되었습니다.")
            } else {
                await adminCreateDepartment(formData)
                toast.success("새 부서가 등록되었습니다.")
            }
            setIsDialogOpen(false)
            loadDepartments()
        } catch (error: any) {
            toast.error(error.message || "처리에 실패했습니다.")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("정말 이 부서를 삭제하시겠습니까? 관련 사원 정보에 영향을 줄 수 있습니다.")) return
        try {
            await adminDeleteDepartment(id)
            toast.success("부서가 삭제되었습니다.")
            loadDepartments()
        } catch (error: any) {
            toast.error(error.message || "삭제 실패")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">부서 관리</h1>
                    <p className="text-muted-foreground">조직의 부서를 추가하고 정보를 관리합니다.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    부서 생성
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>부서 목록</CardTitle>
                    <CardDescription>현재 등록된 모든 부서의 상세 정보입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>부서명</TableHead>
                                <TableHead>연락처</TableHead>
                                <TableHead>이메일</TableHead>
                                <TableHead>위치</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">로딩 중...</TableCell>
                                </TableRow>
                            ) : departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">등록된 부서가 없습니다.</TableCell>
                                </TableRow>
                            ) : (
                                departments.map((dept) => (
                                    <TableRow key={dept.departNo}>
                                        <TableCell className="font-semibold text-primary">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {dept.departName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {dept.departTel}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                {dept.departMail}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {dept.departLocation}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(dept)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(dept.departNo)}>
                                                    <Trash2 className="h-4 w-4" />
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingDept ? "부서 정보 수정" : "새 부서 등록"}</DialogTitle>
                            <DialogDescription>
                                부서의 기본 정보를 입력해주세요.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="departName" className="text-right text-xs">부서명</Label>
                                <Input id="departName" className="col-span-3" value={formData.departName} onChange={e => setFormData({ ...formData, departName: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="departTel" className="text-right text-xs">연락처</Label>
                                <Input id="departTel" className="col-span-3" placeholder="02-XXX-XXXX" value={formData.departTel} onChange={e => setFormData({ ...formData, departTel: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="departMail" className="text-right text-xs">이메일</Label>
                                <Input id="departMail" type="email" className="col-span-3" placeholder="dept@workhub.com" value={formData.departMail} onChange={e => setFormData({ ...formData, departMail: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="departLocation" className="text-right text-xs">위치</Label>
                                <Input id="departLocation" className="col-span-3" placeholder="예: 4층 A구역" value={formData.departLocation} onChange={e => setFormData({ ...formData, departLocation: e.target.value })} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">{editingDept ? "수정 완료" : "등록 완료"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
