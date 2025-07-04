"use client"

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase/config"

// Définition de l'interface Notification
export type Notification = {
  id: string
  senderId: string
  message: string
  timestamp: string
  read: boolean
  target: "admin" | "user"
}

export function useNotifications(target: "admin" | "user") {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const notifRef = ref(rtdb, `notifications/${target}`)

    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setNotifications([])
        return
      }

      const result: Notification[] = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        senderId: value.senderId || "",
        message: value.message || "",
        timestamp: value.timestamp || "",
        read: value.read || false,
        target,
      }))

      // Trier par la date décroissante
      setNotifications(result.sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
    })

    return () => unsubscribe()
  }, [target])

  return notifications
}

