"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { NotificationList } from "./notification-list";
import type { Notification } from "@/types/notification";
import { Loader2 } from "lucide-react";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "@/lib/firebase/config";
  import { useAuth } from '@/components/auth-provider'
export function NotificationContainer() {
  const { user } = useAuth();  // Utilisation du hook pour obtenir l'utilisateur connecté
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  // Ajout d'un état d'erreur

  useEffect(() => {
    if (!user) {
      setError("Utilisateur non connecté");
      setIsLoading(false);
      return;
    }

    const userId = user.uid;  // Utilisation de l'ID utilisateur dynamique
    const notificationsRef = ref(rtdb, `notifications/${userId}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convertir l'objet JSON en tableau
        const notificationsArray = Object.values(data);
        setNotifications(notificationsArray as Notification[]);
      } else {
        setNotifications([]);
      }
      setIsLoading(false);
    }, (error) => {
      setError("Erreur de récupération des notifications");
      setIsLoading(false);
      console.error(error);  // Log l'erreur pour déboguer
    });

    return () => off(notificationsRef);
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Header title="Notifications" />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Chargement des notifications...</p> {/* Message de chargement */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Header title="Notifications" />
        <div className="text-red-600 text-center">
          <p>{error}</p>  {/* Message d'erreur */}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Header title="Notifications" />
      <NotificationList notifications={notifications} />
    </div>
  );
}