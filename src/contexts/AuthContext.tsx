import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, setToken as persistToken } from "@/lib/api";
import { fetchCurrentUser, logout as logoutRequest } from "@/lib/auth";
import { profileToFrontendRole, type FrontendRole, type User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: FrontendRole | null;
  guestRole: FrontendRole | null;
  effectiveRole: FrontendRole | null;
  setGuestRole: (role: FrontendRole | null) => void;
  /** Chame depois de um login/cadastro bem-sucedido pra popular o contexto sem recarregar a página. */
  setAuthenticatedUser: (user: User) => void;
  /** Recarrega os dados do usuário logado (ex: depois de editar o perfil). */
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  guestRole: null,
  effectiveRole: null,
  setGuestRole: () => {},
  setAuthenticatedUser: () => {},
  refreshUser: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestRole, setGuestRoleState] = useState<FrontendRole | null>(
    (localStorage.getItem("flinker_guest_role") as FrontendRole) || null
  );

  const setGuestRole = (role: FrontendRole | null) => {
    if (role) {
      localStorage.setItem("flinker_guest_role", role);
    } else {
      localStorage.removeItem("flinker_guest_role");
    }
    setGuestRoleState(role);
  };

  const userRole = user ? profileToFrontendRole(user.profile) : null;

  // Guest role (escolha explícita no onboarding) tem prioridade sobre o papel real da conta
  const effectiveRole = guestRole || userRole;

  const setAuthenticatedUser = (nextUser: User) => {
    setUser(nextUser);
    setGuestRole(null);
  };

  const refreshUser = async () => {
    try {
      const fresh = await fetchCurrentUser();
      setUser(fresh);
    } catch {
      // Se falhar (ex: token expirou), deixa o próximo request 401 tratar o logout.
    }
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        // Token inválido/expirado — já foi limpo pelo cliente de API (ver src/lib/api.ts)
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await logoutRequest().catch(() => {
      // Mesmo se a chamada falhar (ex: token já expirado), limpamos o estado local.
      persistToken(null);
    });
    setUser(null);
    setGuestRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, userRole, guestRole, effectiveRole, setGuestRole, setAuthenticatedUser, refreshUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
