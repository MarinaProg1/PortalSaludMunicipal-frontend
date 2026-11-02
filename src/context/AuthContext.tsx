import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, debeCambiarPassword: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (token: string, debeCambiarPassword: boolean) => {
    localStorage.setItem("token", token);
    setToken(token);

    if (debeCambiarPassword) {
      window.location.href = "/cambiar-password";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
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