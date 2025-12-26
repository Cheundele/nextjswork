"use client"

import { useAuth } from "@/components/authprovider"
import { useState } from "react"
import { supabase } from "@/lib/supabase/authclient"

import InputFormComponent from "@/components/inputcomponent"
import UserLabel from "@/components/userlabel"
import UserPrompts from "@/components/user-prompts"


export default function LoginClient() {
    const { user, profile, loading } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    async function signUp() {
        setMessage("Creating account...")

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setMessage(`❌ ${error.message}`)
            return
        }

        if (data.user) {
            await supabase.from("profiles").insert({
                id: data.user.id,
                display_name: email.split("@")[0],
            })
        }

        setMessage("✅ Account created. You are now logged in.")
    }

    async function login() {
        setMessage("Checking...")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) setMessage("❌ Invalid login")
        else setMessage("✅ Logged in")
    }

    async function logout() {
        await supabase.auth.signOut()
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="flex justify-center mt-8">
            <div className="w-80 flex flex-col gap-4">
                {user ? (
                    <>
                        <UserLabel username={profile?.display_name ?? "User"} />
                        <button onClick={logout}>Logout</button>
                        <UserPrompts />
                    </>
                ) : (
                    <>
                        <UserLabel username="Visitor" />
                        <InputFormComponent
                            username={email}
                            password={password}
                            message={message}
                            onUsernameChange={setEmail}
                            onPasswordChange={setPassword}
                            onSubmit={login}
                        />
                        <button onClick={signUp}>Sign Up</button>
                    </>
                )}
            </div>
        </div>
    )
}
