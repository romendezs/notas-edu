"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface CourseStudent {
  studentId: string;
  asistencia?: number;
  tareas?: number;
  examen?: number;
}

interface Course {
  id: string;
  name: string;
  teacherId: string;
  students: (string | CourseStudent)[];
}

interface StudentRow {
  id: string;
  name: string;
  asistencia: number;
  tareas: number;
  examen: number;
}

export default function TeacherPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teacherId, setTeacherId] = useState("");

  // Detectar docente autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTeacherId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar solo cursos del docente autenticado
  useEffect(() => {
    if (!teacherId) return;

    const fetchCourses = async () => {
      const q = query(
        collection(db, "courses"),
        where("teacherId", "==", teacherId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Course)
      );
      setCourses(data);
    };

    fetchCourses();
  }, [teacherId]);

  // Cargar estudiantes cuando se selecciona curso
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;

      const courseSnap = await getDoc(doc(db, "courses", selectedCourse));
      if (!courseSnap.exists()) return;

      const courseData = courseSnap.data() as Course;
      const studentsArray = courseData.students || [];

      const normalized = studentsArray.map((s: any) =>
        typeof s === "string"
          ? { studentId: s, asistencia: 0, tareas: 0, examen: 0 }
          : {
              studentId: s.studentId,
              asistencia: s.asistencia ?? 0,
              tareas: s.tareas ?? 0,
              examen: s.examen ?? 0,
            }
      );

      const studentDocs = await Promise.all(
        normalized.map((s) => getDoc(doc(db, "users", s.studentId)))
      );

      const studentData: StudentRow[] = studentDocs.map((d, i) => {
        const user = d.data() as any;
        return {
          id: normalized[i].studentId,
          name: user?.name || "Sin nombre",
          asistencia: normalized[i].asistencia,
          tareas: normalized[i].tareas,
          examen: normalized[i].examen,
        };
      });

      setStudents(studentData);
    };

    fetchStudents();
  }, [selectedCourse]);

  const handleChange = (id: string, field: keyof StudentRow, value: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    const courseRef = doc(db, "courses", selectedCourse);

    const updatedStudents = students.map((s) => ({
      studentId: s.id,
      asistencia: s.asistencia,
      tareas: s.tareas,
      examen: s.examen,
    }));

    await updateDoc(courseRef, { students: updatedStudents });

    alert("Cambios guardados correctamente ✅");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          📋 Panel de Calificaciones - Docente
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Seleccionar Curso
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300"
          >
            <option value="">-- Seleccione --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-2 text-left">Estudiante</th>
                    <th className="p-2 text-center">Asistencia (30%)</th>
                    <th className="p-2 text-center">Tareas (50%)</th>
                    <th className="p-2 text-center">Examen (20%)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b even:bg-gray-50">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={s.asistencia}
                          onChange={(e) =>
                            handleChange(
                              s.id,
                              "asistencia",
                              parseFloat(e.target.value)
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-center"
                          min="0"
                          max="10"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={s.tareas}
                          onChange={(e) =>
                            handleChange(
                              s.id,
                              "tareas",
                              parseFloat(e.target.value)
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-center"
                          min="0"
                          max="10"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={s.examen}
                          onChange={(e) =>
                            handleChange(
                              s.id,
                              "examen",
                              parseFloat(e.target.value)
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-center"
                          min="0"
                          max="10"
                          step="0.01"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
            >
              💾 Guardar Cambios
            </button>
          </>
        )}
      </div>
    </div>
  );
}
