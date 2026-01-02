// app/banana/page.tsx
import type { Metadata } from "next"
import BananaClient from "./BananaClient"

export const metadata: Metadata = {
  title: "Nano Banana Pro - Free AI Image Generator & Editor",
  description:
    "Nano Banana Pro is your go-to AI image generation tool.",
}

export default function BananaPage() {
  return <BananaClient />
}
