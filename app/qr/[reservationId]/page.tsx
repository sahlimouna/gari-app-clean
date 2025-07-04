
import { notFound } from "next/navigation";
import { rtdb } from "@/lib/firebase/config";
import { ref, get } from "firebase/database";
import { QRCodeGenerator } from "@/components/qr/qr-code-generator";

export default async function QRPage({ params }: { params: { reservationId: string } }) {
  const reservationId = params?.reservationId;

  if (!reservationId) notFound();

  // ✅ استرجع الحجز من RTDB
  const reservationSnap = await get(ref(rtdb, `requests/${reservationId}`));
  const reservation = reservationSnap.exists() ? reservationSnap.val() : null;
  if (!reservation) notFound();

  // ✅ احسب المبلغ إذا لم يكن محفوظ
  const startDate = new Date(reservation.start);
  const endDate = new Date(reservation.end);
  const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const amount = hours * reservation.pricePerHour; // تأكد pricePerHour محفوظ وإلا أرسله من صفحة الحجز

  // ✅ استرجع بيانات موقف السيارات (من Firestore أو ثابت إذا مخزن محليًا)
  const parkingName = reservation.parkingName || "Parking inconnu";

  return (
    <QRCodeGenerator
      reservationId={reservationId}
      parkingName={parkingName}
      startDate={startDate}
      endDate={endDate}
      amount={amount}
    />
  );
}
