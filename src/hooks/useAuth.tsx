import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/tracking";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isFinance: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFinance, setIsFinance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error checking roles:", error);
        setIsAdmin(false);
        setIsFinance(false);
      } else {
        const roles = (data || []).map((r) => r.role);
        setIsAdmin(roles.includes("admin"));
        setIsFinance(roles.includes("finance"));
      }
    } catch (error) {
      console.error("Error in checkRoles:", error);
      setIsAdmin(false);
      setIsFinance(false);
    } finally {
      setIsLoading(false); // ALWAYS resolves loading state!
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkRoles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // 2. State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN") {
            const provider = (session.user.app_metadata?.provider as string) || "email";
            track.login(session.user.email ?? null, provider, true);
          }
          checkRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsFinance(false);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/admin`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsFinance(false);
  };

  const isEmailVerified = !!user?.email_confirmed_at;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isFinance,
        isLoading,
        isEmailVerified,
        signIn,
        signUp,
        signOut,
      }}
    >
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