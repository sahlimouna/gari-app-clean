"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { ParkingList } from "./parking-list";
import type { Parking } from "@/types/parking";
import { Loader2 } from "lucide-react";

// ✅ استيراد Realtime Database tools
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "@/lib/firebase/config";

export function ParkingListContainer() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ إذا المستخدم غير مسجل ➜ توجيه لصفحة تسجيل الدخول
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    // ✅ إذا المستخدم موجود ➜ استمع للـ parkings من Realtime DB
    if (user) {
      const parkingsRef = ref(rtdb, "parkings");

      // 🔑 Listener لحظي
      const unsubscribe = onValue(
        parkingsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // 🔑 حول الـ object إلى Array
            const parkingsArray: Parking[] = Object.entries(data).map(
              ([id, parking]) => ({
                id,
                ...(parking as Omit<Parking, "id">),
              })
            );
            setParkings(parkingsArray);
          } else {
            setParkings([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error loading parkings:", error);
          setParkings([]);
          setIsLoading(false);
        }
      );

      // ✅ Clean up لما يغلق الكومبوننت
      return () => off(parkingsRef);
    }
  }, [user, loading, router]);

  // ✅ الحالة: تحميل بيانات
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // ✅ الحالة: المستخدم غير موجود (حماية إضافية)
  if (!user) {
    return null;
  }

  // ✅ الحالة: عرض القائمة
  return <ParkingList parkings={parkings} />;
}
