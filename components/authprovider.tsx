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

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        if (!mounted) return

        setUser(currentUser)

        if (currentUser) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", currentUser.id)
            .single()

          if (!mounted) return
          setProfile(!error ? profileData ?? null : null)
        }
      } catch (err) {
        console.error("[AuthProvider] getSession error:", err)
        if (!mounted) return
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        const newUser = session?.user ?? null
        setUser(newUser)

        if (!newUser) {
          setProfile(null)
          setLoading(false)
          return
        }

        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", newUser.id)
            .single()

          if (!mounted) return
          setProfile(!error ? profileData ?? null : null)
        } catch (err) {
          console.error("[AuthProvider] profile fetch error:", err)
          if (!mounted) return
          setProfile(null)
        } finally {
          if (mounted) setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
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
