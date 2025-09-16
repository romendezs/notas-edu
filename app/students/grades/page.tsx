"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Link from "next/link";
import { app } from "@/app/firebase/firebase";

interface Course {
  id: string;
  name: string;
  asistencia: number;
  tareas: number;
  examen: number;
}

export default function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const user = auth.currentUser;

      if (!user) return;

      // Get user info (fetch only the current user's document)
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      setStudentName(userDocSnap?.data()?.name || "");

      // Get all courses
      const coursesRef = collection(db, "courses");
      const snapshot = await getDocs(coursesRef);

      const list: Course[] = snapshot.docs
        .map(doc => {
          const data = doc.data() as any;
          const studentEntry = data.students?.find(
            (s: any) => s.studentId === user.uid
          );
          if (!studentEntry) return null; // skip courses without this student
          return {
            id: doc.id,
            name: data.name,
            asistencia: studentEntry.asistencia ?? 0,
            tareas: studentEntry.tareas ?? 0,
            examen: studentEntry.examen ?? 0,
          };
        })
        .filter(Boolean) as Course[];

      setCourses(list);
    };

    fetchData();
  }, []);

  const calculateFinal = (a: number, t: number, e: number) => {
    return (a * 0.3 + t * 0.5 + e * 0.2).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Mis Notas Académicas</h1>
        <p className="text-gray-600 mb-4">Estudiante: <span className="font-semibold">{studentName}</span></p>

        <div className="flex gap-4 mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Asistencia: 30%</span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Tareas: 50%</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Examen: 20%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Asignatura</th>
                <th className="p-2 text-center">Asistencia</th>
                <th className="p-2 text-center">Tareas</th>
                <th className="p-2 text-center">Examen</th>
                <th className="p-2 text-center">Promedio Final</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={c.id} className="border-b even:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-semibold">{c.name}</td>
                  <td className="p-2 text-center">{c.asistencia.toFixed(2)}</td>
                  <td className="p-2 text-center">{c.tareas.toFixed(2)}</td>
                  <td className="p-2 text-center">{c.examen.toFixed(2)}</td>
                  <td className="p-2 text-center text-green-600 font-bold">
                    {calculateFinal(c.asistencia, c.tareas, c.examen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="mt-6 bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition">
          <Link href="/dashboard">← Volver al Dashboard</Link>
        </button>
      </div>
    </div>
  );
}
