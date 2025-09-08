"use client";
import React from "react";

interface GoogleButtonProps {
  onClick: () => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
  >
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google"
      className="h-5 w-5"
    />
    Continue with Google
  </button>
);
