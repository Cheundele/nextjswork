"use client"

import { useAuth } from "@/components/authprovider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function RequiredAuth({
    children,
    redirectTo,
}: {
    children: React.ReactNode
    redirectTo?: string
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            const target = redirectTo ?? pathname ?? "/"
            router.replace(`/login?redirect=${encodeURIComponent(target)}`)
        }
    }, [loading, user, router, pathname, redirectTo])

    if (loading || !user) return null

    return <>{children}</>
}
