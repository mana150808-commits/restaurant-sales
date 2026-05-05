import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

if (!getApps().length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!key) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY が設定されていません")

  let serviceAccount
  try {
    serviceAccount = JSON.parse(key)
  } catch {
    serviceAccount = JSON.parse(Buffer.from(key, "base64").toString("utf-8"))
  }

  initializeApp({ credential: cert(serviceAccount) })
}

export const db = getFirestore()
