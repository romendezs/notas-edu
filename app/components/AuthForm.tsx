"use client";
import React from "react";

interface AuthFormProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
  submitText: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  error,
  submitText,
}) => (
  <form className="space-y-4" onSubmit={onSubmit}>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
        required
      />
    </div>

    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

    <button
      type="submit"
      className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition"
    >
      {submitText}
    </button>
  </form>
);
