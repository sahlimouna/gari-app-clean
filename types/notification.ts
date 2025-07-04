export interface Notification {
  id: string                    // معرف الإشعار
  userId: string                // معرف المستخدم الذي تلقى الإشعار
  title: string                 // عنوان الإشعار
  message: string               // نص الإشعار
  read: boolean                 // هل تمت قراءة الإشعار؟
  date: number                  // تاريخ الإشعار (timestamp in milliseconds)
  type: "reservation" | "payment" | "system"  // نوع الإشعار
  relatedId?: string            // ID متعلق بالحجز أو الدفع
}
