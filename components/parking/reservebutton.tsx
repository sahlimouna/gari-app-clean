"use client"

import { push, set, ref } from "firebase/database"
import { rtdb, auth } from "@/lib/firebase/config"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"
import { useAuth } from "@/components/auth-provider"
export function ReserveButton({
  parkingId,
  start,
  end,
  disabled,
}: {
  parkingId: string
  start: string
  end: string
  disabled: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  const handleReserve = async () => {
    if (loading) {
      toast({
        title: "Chargement",
        description: "Patientez pendant la vérification de votre session...",
      })
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter pour effectuer une réservation.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    try {
      const reservationRef = push(ref(rtdb, "requests"))

      await set(reservationRef, {
        parkingId,
        startDate: start,
        endDate: end,
        status: "pending",
        createdAt: Date.now(),
        clientId: currentUser.uid,
      })

      toast({
        title: "Réservation enregistrée",
        description: "Votre demande a bien été envoyée.",
      })

      router.push(`/home/parking/${parkingId}/reserve?reservationId=${reservationRef.key}`)
    } catch (error) {
      console.error("Erreur réservation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleReserve} disabled={disabled || loading} className="w-full mt-4">
      Réserver maintenant
    </Button>
  )
}
