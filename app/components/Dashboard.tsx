"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "./Header";
import { logout } from "../lib/authService";

interface DashboardProps {
  role: "student" | "teacher" | "admin";
  username: string;
}

export default function Dashboard({ role, username }: DashboardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Optional: automatic redirect to role-specific dashboard pages
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header username={username} showLogout={true} onLogout={handleLogout} />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-3">
          {/* STUDENT PANEL */}
          {role === "student" && (
            <Link
              href="/students/grades"
              className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-lg shadow"
            >
              Ver mis calificaciones
            </Link>
          )}

          {/* TEACHER PANEL */}
          {role === "teacher" && (
            <Link
              href="/teachers/grades"
              className="block bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg shadow"
            >
              Gestionar calificaciones
            </Link>
          )}

          {/* ADMIN PANEL */}
          {role === "admin" && (
            <>
              <Link
                href="/admin/cursos"
                className="block bg-purple-500 hover:bg-purple-600 text-white text-center py-2 rounded-lg shadow"
              >
                Cursos
              </Link>
              <Link
                href="/admin/estudiantes"
                className="block bg-purple-500 hover:bg-purple-600 text-white text-center py-2 rounded-lg shadow"
              >
                Estudiantes
              </Link>
              <Link
                href="/admin/usuarios"
                className="block bg-purple-500 hover:bg-purple-600 text-white text-center py-2 rounded-lg shadow"
              >
                Usuarios
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
