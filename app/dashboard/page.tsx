"use client";

import Dashboard from "@/app/components/Dashboard";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login"); // redirect if not logged in
      return;
    }

    const fetchRole = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setRole(data.role || "student");
          } else {
            setRole("student"); // default role
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setRole("student");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRole();
  }, [user, authLoading, router]);

  if (authLoading || loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

  return (
    <Dashboard 
      role={role!} 
      username={user.displayName || user.email || "Usuario"} 
    />
  );
}
