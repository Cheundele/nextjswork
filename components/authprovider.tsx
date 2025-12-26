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
    let mounted = true
    console.log("[Auth] useEffect mounted")

    async function resolveInitialSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    resolveInitialSession()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log("[Auth] auth event:", _event)

        if (!mounted) return

        const user = session?.user ?? null
        setUser(user)

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("id", user.id)
          .single()

        if (!mounted) return

        if (!error) setProfile(profileData ?? null)
        setLoading(false)
      })

    return () => {
      mounted = false
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
