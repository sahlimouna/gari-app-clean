export interface Payment {
  id: string                      // معرف الدفع
  userId: string                  // معرف المستخدم
  reservationId: string           // معرف الحجز المرتبط
  parkingId: string               // موقف السيارات
  parkingName: string             // اسم الموقف
  amount: number                  // المبلغ المدفوع بالدينار/اليورو...
  status: "pending" | "completed" | "failed"  // حالة الدفع
  date: number                    // تاريخ الدفع (timestamp in milliseconds)
  paymentMethod?: string          // وسيلة الدفع (بطاقة، نقدًا، إلخ)
  receiptUrl?: string             // رابط إيصال الدفع (اختياري)
}
