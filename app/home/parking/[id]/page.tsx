"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { onValue, ref } from "firebase/database"
import { rtdb } from "@/lib/firebase/config"
import { ProtectedRoute } from "@/components/protected-route"
import { ParkingDetails } from "@/components/parking/parking-details"
import { Loader } from "@/components/ui/loader"

export default function ParkingPage() {
  const [parking, setParking] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const parkingId = params?.id as string
    if (!parkingId) return router.push("/404")

    const parkingRef = ref(rtdb, `parkings/${parkingId}`)
    onValue(parkingRef, (snapshot) => {
      if (!snapshot.exists()) {
        router.push("/404")
        return
      }
      setParking({ id: parkingId, ...snapshot.val() })
      setLoading(false)
    })
  }, [params, router])

  if (loading || !parking) return <Loader />

  return (
    <ProtectedRoute>
      <ParkingDetails parking={parking} />
    </ProtectedRoute>
  )
}
