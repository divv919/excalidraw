"use client";
import { BACKEND_BASE_URL } from "@/config/variables";
import { SigninResponse, SignupResponse, User } from "@/types/auth";
import { createContext, useEffect, useState, useContext } from "react";

export const AuthContext = createContext<{
  signup: ({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }) => Promise<SignupResponse>;
  signin: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<SigninResponse>;
  populateUser: (user: User) => Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}>({
  signup: async () => {
    return new Promise(() => null);
  },
  signin: async () => {
    return new Promise(() => null);
  },
  populateUser: async () => {},
  user: null,
  isAuthenticated: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!localStorage.getItem("user") && !cookieStore.get("authToken")) {
      return;
    }

    const user = localStorage.getItem("user");
    if (user) {
      populateUser(JSON.parse(user));
    }
  }, []);
  const signup = async ({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }) => {
    const response = await fetch(`${BACKEND_BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    });
    if (!response.ok) {
      throw new Error((await response.json()).message);
    }

    return response.json();
  };

  const signin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${BACKEND_BASE_URL}/signin`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error((await response.json()).message);
    }
    return response.json();
  };
  const populateUser = async (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };
  const logout = () => {
    cookieStore.delete("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        populateUser,
        isAuthenticated: !!cookieStore.get("authToken") && !!user,
        user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
