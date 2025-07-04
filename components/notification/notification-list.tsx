"use client";

import { useState, useEffect } from "react";  // Ajoute useState ici
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import type { Notification } from "@/types/notification";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, CreditCard, Calendar, Info } from "lucide-react";
import { NotificationService } from "@/lib/usenotification";  // Assurez-vous d'importer NotificationService

interface NotificationListProps {
  notifications: Notification[];
}

export function NotificationList({ notifications: initialNotifications }: NotificationListProps) {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const getNotificationIcon = (type: string) => {
    const icons = {
      reservation: <Calendar className="h-5 w-5 text-blue-500" />,
      payment: <CreditCard className="h-5 w-5 text-green-500" />,
      system: <Info className="h-5 w-5 text-purple-500" />,
    };

    return icons[type] || icons.system;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead("user", notificationId);
      // Si la notification est marquée comme lue, on peut la mettre à jour localement
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      // Vous pouvez afficher un toast ici pour informer l'utilisateur que la notification n'a pas été marquée comme lue
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("notifications")}</h2>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("noNotifications")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                notification.read ? "" : "border-l-4 border-l-primary"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.timestamp), "PPp", {
                          locale: language === "fr" ? fr : undefined,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {t("new")}
                        </span>
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs mt-2 text-primary underline"
                        >
                          Marquer comme lue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

