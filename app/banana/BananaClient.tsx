"use client"

import { ImageCombiner } from "@/components/image-combiner"

import RequiredAuth from "@/components/RequiredAuth"

export default function BananaClient() {
    return (
        <RequiredAuth redirectTo="/banana">
            <main className="min-h-screen bg-background">
                <ImageCombiner />
            </main>
        </RequiredAuth>
    )
}
