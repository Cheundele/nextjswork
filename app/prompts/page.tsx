"use client"

import { useAuth } from "@/components/authprovider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase/authclient"

import UserLabel from "@/components/userlabel"
import UserPrompts from "@/components/user-prompts"
import RequiredAuth from "@/components/RequiredAuth"

export default function PromptsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log("[/prompts] not logged in → redirect to /login")
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading || !user) return null

  return (
    <div className="flex justify-center mt-8">
      <div className="w-80 flex flex-col gap-4">
        <RequiredAuth>
          <UserLabel username={profile?.display_name ?? "User"} />
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
          <UserPrompts />
        </RequiredAuth>
      </div>
    </div>
  )
}
