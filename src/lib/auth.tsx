"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabaseClient"

export interface User {
  id: string
  email: string
  name?: string
  role?: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, name: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check current session on load
  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const u = data.session.user
        setUser({ id: u.id, email: u.email!, name: u.user_metadata?.name || "" })
      }
      setIsLoading(false)
    }
    getSession()

    // listen for login/logout
    if (!supabase) return
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.name || "" })
      } else {
        setUser(null)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // login
  const login = async (email: string, password: string): Promise<boolean> => {
  if (!supabase) return false
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error("Login failed:", error.message)
      return false
    }
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name || "" })
    }
    return true
  }

  // register
  const register = async (email: string, name: string, password: string): Promise<boolean> => {
  if (!supabase) return false
  const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      console.error("Registration failed:", error.message)
      return false
    }
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email!, name })
    }
    return true
  }

  // logout
  const logout = async () => {
  if (!supabase) return
  await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = user?.role === "admin" // you can later manage roles in Supabase DB

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
