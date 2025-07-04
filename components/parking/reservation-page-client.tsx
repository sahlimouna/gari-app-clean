"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { notFound } from "next/navigation"

import { Header } from "@/components/header"
import { ReservationForm } from "@/components/parking/reservation-form"
import { ProtectedRoute } from "@/components/protected-route"

import { rtdb } from "@/lib/firebase/config"
import { ref, get } from "firebase/database"

export default function ReservePageClient() {
  const searchParams = useSearchParams()
  const params = useParams()

  const [parking, setParking] = useState<any | null>(null)

  const parkingId = params?.id as string | undefined
  const reservationId = searchParams?.get("reservationId") ?? undefined

  useEffect(() => {
    async function fetchData() {
      if (!parkingId || !reservationId) return notFound()
      try {
        const snap = await get(ref(rtdb, `parkings/${parkingId}`))
        if (!snap.exists()) return notFound()
        setParking({ id: parkingId, ...snap.val() })
      } catch {
        return notFound()
      }
    }

    fetchData()
  }, [parkingId, reservationId])

  if (!parking) return <div className="p-4">Chargement...</div>

  return (
    <ProtectedRoute>
      <Header title="Compléter votre réservation" />
      <main className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Compléter votre réservation</h1>
        <ReservationForm parking={parking} reservationId={reservationId!} />
      </main>
    </ProtectedRoute>
  )
}
