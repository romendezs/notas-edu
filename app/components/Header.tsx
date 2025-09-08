// components/Header.tsx
"use client";

interface HeaderProps {
  username: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Header({ username, showLogout = false, onLogout }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between bg-indigo-600 text-white px-6 py-4 rounded-b-2xl shadow">
      <h1 className="text-xl font-semibold">Bienvenido {username} 👋</h1>
      
      {showLogout && (
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow text-sm font-medium"
        >
          Cerrar sesión
        </button>
      )}
    </header>
  );
}
