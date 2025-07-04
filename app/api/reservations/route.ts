import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/lib/firebase/firestore";
import { getServerSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // ✅ تأكد من التحقق من صلاحية الجلسة
    const session = await getServerSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    // ✅ إقرأ البيانات
    const { parkingId, startDate, endDate } = await req.json();

    // ✅ تحقق من البيانات الأساسية
    if (!parkingId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: "Données manquantes" }, { status: 400 });
    }

    // ✅ نفذ الحجز
    const reservationId = await createReservation({
      userId: session.user.id,
      parkingId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    // ✅ رجع استجابة واضحة
    return NextResponse.json({ success: true, reservationId });

  } catch (error: any) {
    console.error("❌ API Reservation Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Erreur interne" }, { status: 500 });
  }
}
