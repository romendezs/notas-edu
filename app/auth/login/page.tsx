"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGooglePopup } from "@/app/lib/authService";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/app/components/AuthForm";
import { GoogleButton } from "@/app/components/GoogleButton";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await signInWithEmail(email, password);
      router.push("/dashboard"); // adjust based on role if needed
    } catch (err: any) {
      setError(err.message);
      router.push("/auth/login"); // stay on login page on error
      alert("Login failed: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGooglePopup();
      router.push("/dashboard"); // adjust based on role
    } catch (err: any) {
      setError(err.message || "Google login failed");
      router.push("/auth/login");
      alert("Google login failed: " + (err.message || "Unknown error"));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (user) router.push("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login to Your Account
        </h1>

        <AuthForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={handleEmailLogin}
          error={error}
          submitText="Sign In"
        />

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <GoogleButton onClick={handleGoogleLogin} />

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
