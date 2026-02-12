import { createContext, useContext, useEffect, useState } from "react";
import { type User, checkLogin, login as apiLogin, logout as apiLogout } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (employeeNo: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const userData = await checkLogin();
                setUser(userData);
            } catch (error) {
                console.log("Not logged in");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (employeeNo: string, password: string) => {
        await apiLogin(employeeNo, password);
        const userData = await checkLogin();
        setUser(userData);
        navigate("/");
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout API failed, but clearing local session", error);
        } finally {
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
