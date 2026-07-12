import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "worker" | "company" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  guestRole: UserRole | null;
  effectiveRole: UserRole | null;
  setGuestRole: (role: UserRole | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  guestRole: null,
  effectiveRole: null,
  setGuestRole: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [guestRole, setGuestRoleState] = useState<UserRole | null>(
    (localStorage.getItem("flinker_guest_role") as UserRole) || null
  );

  const setGuestRole = (role: UserRole | null) => {
    if (role) {
      localStorage.setItem("flinker_guest_role", role);
    } else {
      localStorage.removeItem("flinker_guest_role");
    }
    setGuestRoleState(role);
  };

  // Guest role (explicit onboarding choice) takes priority over DB role
  const effectiveRole = guestRole || userRole;

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setUserRole((data?.role as UserRole) ?? null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRole(session.user.id), 0);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setGuestRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, guestRole, effectiveRole, setGuestRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
