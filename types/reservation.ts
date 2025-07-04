export interface Reservation {
  reservationId: string          // ID الحجز (من push().key)
  parkingId: string              // ID موقف السيارات
  userId: string                 // ID المستخدم (auth)
  startDate: string              // تاريخ البداية بصيغة ISO (toISOString())
  endDate: string                // تاريخ النهاية بصيغة ISO
  firstName: string              // اسم الزبون
  lastName: string               // لقب الزبون
  carBrand: string               // ماركة السيارة
  carColor: string               // لون السيارة
  licensePlate: string          // رقم اللوحة
  licensePlateImageUrl?: string // رابط صورة اللوحة (اختياري)
  status: "pending" | "confirmed" | "assigned"  // حالة الحجز
  createdAt: number              // تاريخ الإنشاء (timestamp in ms)
  updatedAt?: number             // آخر تعديل (timestamp in ms)
}
