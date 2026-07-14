import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "free" | "researcher" | "industrial_premium" | "producer" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  role: AppRole | null;
  isPremium: boolean;
  isPaid: boolean;
  isProducer: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  role: null,
  isPremium: false,
  isPaid: false,
  isProducer: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin role after state update
        if (session?.user) {
          setTimeout(() => {
            loadRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      const priority: AppRole[] = ["admin", "industrial_premium", "researcher", "producer", "free"];
      const primary = priority.find((p) => roles.includes(p)) ?? null;
      setRole(primary);
      setIsAdmin(roles.includes("admin"));
    } catch (error) {
      console.error("Error loading user roles:", error);
      setIsAdmin(false);
      setRole(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setRole(null);
  };

  const isPremium = role === "admin" || role === "industrial_premium";
  const isPaid = isPremium || role === "researcher";
  const isProducer = role === "admin" || role === "producer";

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, role, isPremium, isPaid, isProducer, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
