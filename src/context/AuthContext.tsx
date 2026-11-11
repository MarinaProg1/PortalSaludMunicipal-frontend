import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

function getStoredToken(): string | null {
  const stored = localStorage.getItem("token");
  if (!isTokenValid(stored)) {
    if (stored) localStorage.removeItem("token");
    return null;
  }
  return stored;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => userFromToken(getStoredToken()));

  useEffect(() => {
    const storedToken = getStoredToken();
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
      const payload = decodeJwt(newToken);
      const destino = (payload?.rol || "").toUpperCase() === "PACIENTE" ? "/mis-turnos" : "/turnos";
      window.location.href = destino;
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
        isAuthenticated: isTokenValid(token),
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
