import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getMessaging } from "firebase/messaging"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCv_yTxIDDIRTX4rWDwv_D2pPgYI33gWKk",
  authDomain: "gari-parkinglocal.firebaseapp.com",
  projectId: "ari-parkinglocal",
  storageBucket:"gari-parkinglocal.firebasestorage.app",
  messagingSenderId:"484158155675",
  appId:"1:484158155675:web:9d69bcb0b10085b2cf0f3e",
  measurementId:"G-Z58VSJBWLK",
  databaseURL:"https://gari-parkinglocal-default-rtdb.firebaseio.com/",
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const rtdb = getDatabase(app)

let messaging: any = null
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.error("Firebase messaging failed to initialize", error)
  }
}

export { app, auth, db, storage, messaging, rtdb }
