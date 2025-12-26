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
  console.log("[Auth] provider mounted")

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] auth event:", event)

      const user = session?.user ?? null
      setUser(user)

      // IMPORTANT: clear loading immediately
      setLoading(false)

      if (!user) {
        setProfile(null)
        return
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", user.id)
        .single()

      if (!error) {
        setProfile(profileData ?? null)
      } else {
        setProfile(null)
      }
    })

  return () => {
    subscription.unsubscribe()
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
