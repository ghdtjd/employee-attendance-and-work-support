import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/auth-context"
import { Toaster } from "sonner"
import DashboardPage from "./pages/Dashboard"
import LoginPage from "./pages/Login"
import NotificationsPage from "./pages/Notifications"
import AttendancePage from "./pages/Attendance"
import SchedulePage from "./pages/Schedule"
import ReportPage from "./pages/Report"
import SettingsPage from "./pages/Settings"
import AdminDashboard from "./pages/admin/AdminDashboard"
import EmployeeManagement from "./pages/admin/EmployeeManagement"
import DepartmentManagement from "./pages/admin/DepartmentManagement"
import { AdminLayout } from "./components/layout/AdminLayout"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/employees" element={<AdminLayout><EmployeeManagement /></AdminLayout>} />
          <Route path="/admin/departments" element={<AdminLayout><DepartmentManagement /></AdminLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
