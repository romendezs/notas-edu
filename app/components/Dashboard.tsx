"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "./Header";
import { logout } from "../lib/authService";
import { LogOut, BookOpen, Users, UserPlus } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="text-3xl">👋</div>
          <h1 className="text-2xl font-bold text-black">
            Bienvenido, <span className="text-indigo-600">{username}</span>!
          </h1>
          <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-semibold">
            Rol: {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>

        <hr className="border-t border-gray-200" />

        {/* Panel de acciones */}
        <div className="space-y-3">
          {role === "student" && (
            <Link
              href="/students/grades"
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium shadow transition"
            >
              📊 Ver mis calificaciones
            </Link>
          )}

          {role === "teacher" && (
            <Link
              href="/teachers/grades"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium shadow transition"
            >
              📝 Gestionar calificaciones
            </Link>
          )}

          {role === "admin" && (
            <>
              <Link
                href="/admin/courses"
                className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-medium shadow transition"
              >
                <BookOpen className="w-5 h-5" /> Gestionar Cursos
              </Link>
              <Link
                href="/admin/students"
                className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white py-3 rounded-xl font-medium shadow transition"
              >
                <UserPlus className="w-5 h-5" /> Asignar Estudiantes a Cursos
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-medium shadow transition"
              >
                <Users className="w-5 h-5" /> Gestionar Usuarios
              </Link>
            </>
          )}
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-xl font-medium shadow transition mt-4"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}