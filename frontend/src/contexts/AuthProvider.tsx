// src/contexts/AuthProvider.tsx
import { useState, type ReactNode } from "react";
import type { User } from "../types/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("utilisateur");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  function loginUser(token: string, user: User) {
    localStorage.setItem("token", token);
    localStorage.setItem("utilisateur", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function updateUser(updatedUser: User) {
    localStorage.setItem("utilisateur", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loginUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}