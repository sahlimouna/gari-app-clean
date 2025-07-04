"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProfileForm } from "@/components/profile/profile-form"
import type { UserProfile } from "@/types/user"
import { Loader2 } from "lucide-react"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase/config"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      const snap = await get(ref(rtdb, `users/${user.uid}`))
      if (snap.exists()) {
        setProfile({ id: user.uid, ...snap.val() })
      } else {
        // Créer un profil par défaut s'il n'existe pas
        setProfile({
          id: user.uid,
          email: user.email || "",
          firstName: "",
          lastName: "",
          phone: "",
          notificationsEnabled: true,
        })
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Header title="Profil" backUrl="/settings" />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Header title="Profil" backUrl="/settings" />
      <ProfileForm profile={profile} onUpdate={loadProfile} />
    </div>
  )
}
