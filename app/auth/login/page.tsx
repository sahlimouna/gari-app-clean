import { Suspense } from "react"
import LoginClient from "@/components/auth/LoginClient"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginClient />
    </Suspense>
  )
}
