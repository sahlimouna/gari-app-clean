// lib/firebase/admin.ts
import * as admin from "firebase-admin"

// Check if Firebase Admin app is already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle private key newlines
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  } catch (error: any) {
    console.error("Firebase Admin initialization error", error.stack)
  }
}

const adminAuth = admin.auth()
const adminDb = admin.firestore()
const adminStorage = admin.storage()

export { adminAuth, adminDb, adminStorage }
