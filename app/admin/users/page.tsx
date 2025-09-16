"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    if (!name || !email || !password || !role) return alert("Completa todos los campos");

    // 1. Create user in Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password);

    // 2. Save user in Firestore
    await addDoc(collection(db, "users"), {
      name,
      email,
      role,
    });

    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    await loadUsers();
  };

  const updateRole = async (userId: string, newRole: string) => {
    // Ask for confirmation
    const confirmed = window.confirm("¿Estás seguro de que quieres cambiar el rol de este usuario?");
    if (!confirmed) return; // Cancel if user selects "No"

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      // Update local state to reflect change immediately
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );

      alert("Rol actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando rol:", error);
      alert("Hubo un error al actualizar el rol");
    }
  };


  const getRoleBadge = (role: string) => {
    const color =
      role === "admin"
        ? "bg-red-600"
        : role === "teacher"
          ? "bg-green-600"
          : "bg-blue-600";
    const label =
      role === "admin"
        ? "Admin"
        : role === "teacher"
          ? "Profesor"
          : "Estudiante";
    return (
      <span
        className={`${color} text-white text-sm px-3 py-1 rounded-full`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 Gestionar Usuarios (Admin)</h1>

      <div className="bg-blue-600 text-white rounded-t-xl px-4 py-2">
        Crear Nuevo Usuario
      </div>

      <div className="border border-blue-600 rounded-b-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre Completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Email"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Contraseña"
            type="password"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Selecciona un rol --</option>
            <option value="admin">Admin</option>
            <option value="teacher">Profesor</option>
            <option value="student">Estudiante</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            onClick={createUser}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Crear Usuario
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">📋 Lista de Usuarios</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-center">
                <td className="border px-4 py-2">{u.id}</td>
                <td className="border px-4 py-2">{u.name}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">
                  <select
                    className="border rounded p-1"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Profesor</option>
                    <option value="student">Estudiante</option>
                  </select>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
