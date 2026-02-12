export interface Task {
    id: number;
    employeeId?: number;
    userId?: number;
    departNo?: number;
    title: string;
    description?: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "PENDING";
    priority?: number;
    dueDate?: string;
    createdAt: string;
}

export interface AttendanceRequest {
    id: number;
    user: User;
    type: "LEAVE" | "REMOTE";
    startDate: string;
    endDate: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    createdAt: string;
}

export interface RequestCreateRequest {
    type: "LEAVE" | "REMOTE";
    startDate: string;
    endDate: string;
    reason: string;
}

const API_BASE_URL = "/api";

export interface User {
    id: number;
    employeeId: number;
    employeeNo: string;
    role: "ADMIN" | "USER";
    name: string;
    email: string;
    phone: string;
    position: string;
    department?: string;
    joinDate: string;
    totalLeave?: number;
    usedLeave?: number;
    remainingLeave?: number;
}

export interface AdminEmployee {
    employeeId: number;
    employeeNo: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    joinDate: string;
    departmentName: string | null;
    totalLeave?: number;
    usedLeave?: number;
    remainingLeave?: number;
}

export interface AdminDashboardStats {
    totalEmployees: number;
    todayAttendanceCount: number;
    pendingCorrectionsCount: number;
    attendanceRate: number;
}

export interface Department {
    departNo: number;
    departName: string;
    departTel: string;
    departMail: string;
    departLocation: string;
}

export async function adminCreateDepartment(data: Partial<Department>): Promise<Department> {
    const res = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("부서 생성 실패")
    return res.json()
}

export async function adminUpdateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("부서 수정 실패")
    return res.json()
}

export async function adminDeleteDepartment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE'
    })
    if (!res.ok) throw new Error("부서 삭제 실패")
}

export async function login(employeeNo: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeNo, password }),
    });

    if (!response.ok) {
        // Backend returns plain string error or 401
        throw new Error("Login failed");
    }

    return response.text();
}

export async function logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error("Logout failed");
    }
}

export async function checkLogin(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/check-login`);
    if (!response.ok) {
        throw new Error("Not logged in");
    }
    return response.json();
}

export async function fetchMyInfo(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/userinfo/me`);
    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }
    return response.json();
}

export async function fetchTasks(scope?: string): Promise<Task[]> {
    const url = scope ? `${API_BASE_URL}/task?scope=${scope}` : `${API_BASE_URL}/task`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch tasks");
    }
    return response.json();
}

export async function fetchTaskById(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch task");
    }
    return response.json();
}

export interface TaskCreateRequest {
    title: string;
    description?: string;
    dueDate?: string;
    employeeId?: number;
    userId?: number;
}

export interface TaskUpdateRequest {
    title?: string;
    description?: string;
    dueDate?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE" | "PENDING";
}

export async function createTask(task: TaskCreateRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });
    if (!response.ok) {
        throw new Error("Failed to create task");
    }
    return response.json();
}

export async function updateTask(id: number, task: TaskUpdateRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });
    if (!response.ok) {
        throw new Error("Failed to update task");
    }
    return response.json();
}

export async function deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/task/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete task error:", response.status, errorText);
        throw new Error(errorText || "Failed to delete task");
    }
}

export async function updateTaskStatus(id: number, status: Task["status"]): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        throw new Error("Failed to update task status");
    }
    return response.json();
}

export interface Attendance {
    id: number;
    workDate: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: string;
    statusCode: "NORMAL" | "LATE" | "ABSENT" | "VACATION" | "OVERTIME"; // Adjust based on backend enum
    workHours: number | null;
    notes: string | null;
}

export async function fetchAttendance(): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/attendance/me`);
    if (!response.ok) {
        throw new Error("Failed to fetch attendance");
    }
    return response.json();
}

export async function fetchAttendanceByMonth(year: number, month: number): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/attendance/me/month?year=${year}&month=${month}`);
    if (!response.ok) {
        throw new Error("Failed to fetch monthly attendance");
    }
    return response.json();
}

export async function fetchTodayAttendance(): Promise<Attendance | null> {
    const response = await fetch(`${API_BASE_URL}/attendance/today`);
    if (!response.ok) {
        throw new Error("Failed to fetch today's attendance");
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    // Handle the text response "오늘 근태 기록이 없습니다." as null
    return null;
}

export async function checkIn(notes?: string): Promise<Attendance> {
    const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Check-in failed");
    }
    return response.json();
}

export async function checkOut(): Promise<Attendance> {
    const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: "POST",
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Check-out failed");
    }
    return response.json();
}

export interface Board {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    importance: "HIGH" | "MIDDLE" | "LOW";
    authorName?: string;
}

export async function fetchBoards(): Promise<Board[]> {
    const response = await fetch(`${API_BASE_URL}/board/list`);
    if (!response.ok) {
        throw new Error("Failed to fetch boards");
    }
    return response.json();
}

export interface UserInfoUpdateRequest {
    email: string;
    phone: string;
}

export async function updateUserInfo(data: UserInfoUpdateRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/info`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update user info");
    }
}


export interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
}

export async function changePassword(data: PasswordChangeRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to change password");
    }
}

export interface ObjectionRequest {
    id: number;
    attendanceDate: string;
    category: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

export interface ObjectionCreateRequest {
    attendanceDate: string;
    category: string;
    reason: string;
}

export async function createObjection(data: ObjectionCreateRequest): Promise<ObjectionRequest> {
    const response = await fetch(`${API_BASE_URL}/objections`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to create objection");
    }
    return response.json();
}

export async function fetchObjections(): Promise<ObjectionRequest[]> {
    const response = await fetch(`${API_BASE_URL}/objections`);
    if (!response.ok) {
        throw new Error("Failed to fetch objections");
    }
    return response.json();
}

export async function deleteObjection(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/objections/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete objection");
    }
}

export async function createRequest(data: RequestCreateRequest): Promise<AttendanceRequest> {
    const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to create request");
    }
    return response.json();
}

export async function fetchRequests(): Promise<AttendanceRequest[]> {
    const response = await fetch(`${API_BASE_URL}/requests`);
    if (!response.ok) {
        throw new Error("Failed to fetch requests");
    }
    return response.json();
}

export async function deleteRequest(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete request");
    }
}

// Admin APIs
export interface RegisterRequest {
    employeeNo: string;
    name: string;
    departNo: number;
    email: string;
    phone: string;
    position: string;
    joinDate: string;
}

export async function adminRegisterEmployee(data: RegisterRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to register employee");
    }
    return response.text();
}

export async function adminFetchEmployees(): Promise<AdminEmployee[]> {
    const response = await fetch(`${API_BASE_URL}/admin/employees`);
    if (!response.ok) {
        throw new Error("Failed to fetch employees");
    }
    return response.json();
}

export async function adminResetPassword(userId: number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/admin/reset-password/${userId}`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error("Failed to reset password");
    }
    return response.text();
}

export async function adminFetchAllAttendance(): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/admin/attendance`);
    if (!response.ok) {
        throw new Error("Failed to fetch all attendance");
    }
    return response.json();
}

export async function adminFetchEmployeeAttendance(employeeId: number): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/admin/attendance/${employeeId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch employee attendance");
    }
    return response.json();
}

export async function adminFetchDashboardStats(): Promise<AdminDashboardStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
    }
    return response.json();
}

export interface AdminEmployeeUpdateRequest {
    name: string;
    email: string;
    phone: string;
    position: string;
    joinDate: string;
    departNo: number;
}

export async function adminUpdateEmployee(employeeId: number, data: AdminEmployeeUpdateRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/employees/${employeeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Failed to update employee");
    }
}

export interface AdminRequestItem {
    id: number;
    type: string;
    employeeNo: string;
    employeeName: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
}

// --- Admin Request Management ---

export async function adminFetchObjections(): Promise<AdminRequestItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/objections`)
    if (!res.ok) throw new Error("Failed to fetch admin objections")
    return res.json()
}

export async function adminUpdateObjectionStatus(id: number, status: string): Promise<ObjectionRequest> {
    const res = await fetch(`${API_BASE_URL}/admin/objections/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error("Failed to update objection status")
    return res.json()
}

export async function adminFetchRequests(): Promise<AdminRequestItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/requests`)
    if (!res.ok) throw new Error("Failed to fetch admin requests")
    return res.json()
}

export async function adminApproveRequest(id: number): Promise<AttendanceRequest> {
    const res = await fetch(`${API_BASE_URL}/admin/requests/${id}/approve`, {
        method: 'PUT'
    })
    if (!res.ok) throw new Error("Failed to approve request")
    return res.json()
}

export async function adminRejectRequest(id: number): Promise<AttendanceRequest> {
    const res = await fetch(`${API_BASE_URL}/admin/requests/${id}/reject`, {
        method: 'PUT'
    })
    if (!res.ok) throw new Error("Failed to reject request")
    return res.json()
}

export async function fetchDepartments(): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (!response.ok) {
        throw new Error("Failed to fetch departments");
    }
    return response.json();
}
