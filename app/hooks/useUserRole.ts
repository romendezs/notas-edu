// hooks/useUserRole.ts
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { auth } from "@/app/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function useUserRole() {
  const [role, setRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setRole(data.role || "student");
            setUsername(data.name || user.email || "User");
          } else {
            setRole("student");
            setUsername(user.email || "User");
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      } else {
        setRole(null);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { role, username, loading };
}
