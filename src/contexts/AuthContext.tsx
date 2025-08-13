import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { apiService } from "../services/api";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// Componente proveedor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    const storedToken = localStorage.getItem("adminToken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminToken");
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await apiService.login({ email, password });
        if (response && response.success && response.token) {
          // Guardar token y datos del usuario
          localStorage.setItem("adminToken", response.token);

          const userData = {
            id: response.user.id || response.user._id,
            email: response.user.email,
            role: response.user.role,
            name: response.user.name || response.user.firstName || "Admin",
          };

          localStorage.setItem("adminUser", JSON.stringify(userData));

          setUser(userData);
          setToken(response.token);

          return true;
        } else {
          return false;
        }
      } catch (error) {
        throw error;
      }
    },
    []
  ); // Dependencias vacías porque apiService es una instancia singleton y setUser/setToken son estables.

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setToken(null);
  }, []); // Dependencias vacías porque setUser/setToken son estables.

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user && !!token,
    }),
    [user, token, loading, login, logout]
  ); // Dependencias para useMemo

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
