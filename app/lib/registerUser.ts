// lib/registerUser.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/app/firebase/firebase";

export async function registerUser(user: User) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || user.email?.split("@")[0],
      role: "student",
      createdAt: serverTimestamp(),
    });
  }
}
