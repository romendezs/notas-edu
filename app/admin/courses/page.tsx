"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/app/firebase/firebase";

interface Course {
  id: string;
  name: string;
  teacherId: string;
  createdAt: Date;
}

interface Teacher {
  uid: string;
  displayName: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<(Course & { teacherName?: string })[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const coursesRef = collection(db, "courses");

  // ✅ Check if user is admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data()?.role;

      if (role !== "admin") {
        router.push("/");
        return;
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchTeachers = async () => {
    const teachersQuery = query(
      collection(db, "users"),
      where("role", "==", "teacher")
    );
    const snapshot = await getDocs(teachersQuery);
    const data = snapshot.docs.map((d) => ({
      uid: d.id,
      displayName: d.data().displayName as string,
    }));
    console.log("[fetchTeachers] Teachers fetched:", data);
    setTeachers(data);
  };

  const fetchCourses = async () => {
    console.log("[fetchCourses] Fetching courses...");
    const snapshot = await getDocs(coursesRef);
    console.log("[fetchCourses] Raw snapshot:", snapshot.docs);
    const coursesData = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Course, "id">),
    })) as Course[];

    console.log("[fetchCourses] Raw courses data:", coursesData);

    // attach teacher name by matching with teachers state
    const usersSnap = await getDocs(collection(db, "users"));
    const usersMap = new Map(
      usersSnap.docs.map((d) => [d.id, d.data().displayName])
    );

    const withNames = coursesData.map((c) => ({
      ...c,
      teacherName: usersMap.get(c.teacherId) || "Unknown",
    }));

    console.log("[fetchCourses] Courses fetched:", withNames);
    setCourses(withNames);
  };

  const createCourse = async () => {
    if (!name.trim() || !teacherId) return;

    setLoading(true);
    console.log("[createCourse] Creating course:", { name, teacherId });
    await addDoc(coursesRef, {
      name,
      teacherId,
      createdAt: Timestamp.now(),
    });
    setName("");
    setTeacherId("");
    await fetchCourses();
    setLoading(false);
    console.log("[createCourse] Course created and courses re-fetched.");
  };

  const deleteCourse = async (id: string) => {
    await deleteDoc(doc(db, "courses", id));
    setCourses((prev) => prev.filter((c) => c.id !== id));
    console.log("[deleteCourse] Course deleted:", id);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // double-check user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.data()?.role !== "admin") {
        router.push("/");
        return;
      }
      console.log("[useEffect] User is admin, fetching initial data...");
      await fetchTeachers();
      await fetchCourses();
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-black">Admin - Manage Courses</h1>

      {/* Create Course Section */}
      <div className="bg-white shadow p-6 rounded-2xl mb-10 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Create New Course</h2>
        <input
          type="text"
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3 text-black placeholder-black"
        />
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3 text-black"
        >
          <option value="" className="text-black">Select a teacher</option>
          {teachers.map((t) => (
            <option key={t.uid} value={t.uid} className="text-black">
              {t.displayName}
            </option>
          ))}
        </select>
        <button
          onClick={createCourse}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Courses</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-black">Name</th>
              <th className="py-2 text-black">Teacher</th>
              <th className="py-2 text-black">Created</th>
              <th className="py-2 text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id} className="border-b hover:bg-gray-50">
                <td className="py-2 text-black">{course.name}</td>
                <td className="py-2 text-black">{course.teacherName}</td>
                <td className="py-2 text-black">
                  {course.createdAt
                    ? new Date(course.createdAt as any).toLocaleDateString()
                    : ""}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
