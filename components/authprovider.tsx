"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase/authclient"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null,
  profile: Profile | null,
  loading: boolean
}

type Profile = {
  id: string
  display_name: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[AuthProvider] mounted")

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthProvider] onAuthStateChange event:", event)

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (!currentUser) {
          console.log("[AuthProvider] user is null, clearing profile")
          setProfile(null)
          setLoading(false)
          return
        }

        console.log("[AuthProvider] fetching profile for user:", currentUser.id)
        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", currentUser.id)
            .single()

          if (error) {
            console.error("[AuthProvider] profile fetch error:", error)
            setProfile(null)
          } else {
            console.log("[AuthProvider] profile loaded:", profileData)
            setProfile(profileData)
          }
        } catch (err) {
          console.error("[AuthProvider] unexpected profile fetch error:", err)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      console.log("[AuthProvider] unsubscribing auth listener")
      listener.subscription.unsubscribe()
    }
  }, [])


  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
