"use client";
import { api } from "@/lib/api";
import type { Session, User } from "@/types/api";
import { createContext, useContext, useEffect, useState } from "react";
type Value = {
  user: User | null;
  loading: boolean;
  setSession: (s: Session) => void;
  logout: () => void;
};
const Context = createContext<Value | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("accessToken"))
      .finally(() => setLoading(false));
  }, []);
  const setSession = (s: Session) => {
    localStorage.setItem("accessToken", s.accessToken);
    setUser(s.user);
  };
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/login";
  };
  return (
    <Context.Provider value={{ user, loading, setSession, logout }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider requerido");
  return value;
}
