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

  function logout(redirectTo?: string) {
  localStorage.removeItem("token");
  localStorage.removeItem("utilisateur");

  // Avec une destination : on recharge sans toucher à l'état React,
  // pour que ProtectedRoute n'ait pas le temps de rediriger vers /login
  if (redirectTo) {
    window.location.replace(redirectTo);
    return;
  }

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