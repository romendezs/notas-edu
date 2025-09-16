"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export default function AssignStudentsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const coursesSnap = await getDocs(collection(db, "courses"));

      // Only keep users with role "student"
      const studentUsers = usersSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((u) => u.role === "student");

      setUsers(studentUsers);
      setCourses(coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAssignedStudents([]);
      return;
    }
    const course = courses.find((c) => c.id === selectedCourse);
    if (course) {
      const assigned = course.students
        ?.map((s: any) => users.find((u) => u.id === s.studentId))
        .filter(Boolean);
      setAssignedStudents(assigned || []);
    }
  }, [selectedCourse, courses, users]);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedCourse) return;

    const courseRef = doc(db, "courses", selectedCourse);

    const studentObj = {
      studentId: selectedStudent,
      asistencia: 0,
      examen: 0,
      tareas: 0,
    };

    await updateDoc(courseRef, {
      students: arrayUnion(studentObj),
    });

    setSelectedStudent("");

    const updatedCourses = await getDocs(collection(db, "courses"));
    setCourses(updatedCourses.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleRemove = async (studentId: string) => {
    const course = courses.find((c) => c.id === selectedCourse);
    if (!course) return;

    const studentObj = course.students.find(
      (s: any) => s.studentId === studentId
    );
    if (!studentObj) return;

    const courseRef = doc(db, "courses", selectedCourse);
    await updateDoc(courseRef, {
      students: arrayRemove(studentObj),
    });

    const updatedCourses = await getDocs(collection(db, "courses"));
    setCourses(updatedCourses.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    const updatedUsers = await getDocs(collection(db, "users"));

    // Only keep students in the assigning dropdown
    const studentUsers = updatedUsers.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((u) => u.role === "student");

    setUsers(studentUsers);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        🧠 Asignar Estudiantes a Cursos (Admin)
      </h1>

      <div className="bg-blue-600 text-white rounded-t-xl px-4 py-2">
        Asignar Estudiante a un Curso
      </div>

      <div className="border border-blue-600 rounded-b-xl p-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm mb-1">Seleccionar Estudiante</label>
          <select
            className="border rounded p-2 w-full"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Selecciona un estudiante --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Seleccionar Curso</label>
          <select
            className="border rounded p-2 w-full"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Selecciona un curso --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAssign}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Asignar Estudiante al Curso
        </button>
      </div>

      {selectedCourse && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Estudiantes Asignados por Curso
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Estudiante</th>
                  <th className="px-4 py-2 border">Rol</th>
                  <th className="px-4 py-2 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map((s) => (
                  <tr key={s.id} className="text-center">
                    <td className="border px-4 py-2">{s.id}</td>
                    <td className="border px-4 py-2">{s.name}</td>
                    <td className="border px-4 py-2">
                      <select
                        className="border p-1 rounded"
                        value={s.role}
                        onChange={(e) =>
                          handleRoleUpdate(s.id, e.target.value)
                        }
                      >
                        <option value="student">Estudiante</option>
                        <option value="teacher">Profesor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleRemove(s.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Desasignar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
