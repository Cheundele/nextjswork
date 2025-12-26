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

    async function initAuth() {
      //await new Promise(res => setTimeout(res, 50))
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null

      if (!mounted) return

      setUser(currentUser)

      if (currentUser) {
        // load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("id", currentUser.id)
          .single()

        if (mounted) {
          setProfile(profileData ?? null)
        }
        else {
          setProfile(null)
        }
      }

      setLoading(false)
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser ?? null)

        if (!newUser) {
          setProfile(null)
          setLoading(false)
          return
        }

        // 3️⃣ Load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("id", newUser.id)
          .single()

        setProfile(profileData ?? null)
        setLoading(false)
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
