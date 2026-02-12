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

export async function fetchTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/task`);
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
    });
    if (!response.ok) {
        throw new Error("Failed to delete task");
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
