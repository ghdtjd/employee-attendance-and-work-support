"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, checkLogin, login as apiLogin, logout as apiLogout } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

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
    const router = useRouter();
    const pathname = usePathname();

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
        router.push("/");
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
        router.push("/login");
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
