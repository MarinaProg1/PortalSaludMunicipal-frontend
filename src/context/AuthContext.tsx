import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { decodeJwt } from "../utils/jwt";

export interface AuthUser {
  id?: string;
  email?: string;
  user?: string;
  rol?: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  rol: string | null;
  isAuthenticated: boolean;
  login: (token: string, debeCambiarPassword: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return { id: payload.id, email: payload.email, user: payload.user, rol: payload.rol };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<AuthUser | null>(() => userFromToken(localStorage.getItem("token")));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setUser(userFromToken(storedToken));
  }, []);

  const login = (newToken: string, debeCambiarPassword: boolean) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userFromToken(newToken));

    if (debeCambiarPassword) {
      window.location.href = "/cambiar-password";
    } else {
      window.location.href = "/turnos";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        rol: user?.rol || null,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
