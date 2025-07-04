import { ref, get, push, set } from "firebase/database";
import { rtdb } from "./config";

/**
 * ✅ إضافة دفعة جديدة في Realtime DB
 */
export async function addPayment(userId: string, paymentData: any) {
  const paymentsRef = ref(rtdb, `payments/${userId}`);
  const newPaymentRef = push(paymentsRef);
  await set(newPaymentRef, paymentData);
}

/**
 * ✅ جلب كل دفعات مستخدم من Realtime DB
 */
export async function getUserPayments(userId: string) {
  const paymentsRef = ref(rtdb, `payments/${userId}`);
  const snapshot = await get(paymentsRef);

  if (snapshot.exists()) {
    // نحول الـ Object إلى Array
    return Object.entries(snapshot.val()).map(([id, value]) => ({
        id,
        ...(typeof value === "object" && value !== null ? value : {}),
      }));
  }
  return [];
}
