"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithGooglePopup } from "@/app/lib/authService";
import { AuthForm } from "@/app/components/AuthForm";
import { GoogleButton } from "@/app/components/GoogleButton";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signUpWithEmail(email, password);
      router.push("/dashboard"); // adjust based on role
    } catch (err: any) {
      setError(err.message);
      router.push("/auth/login"); // redirect to login on error
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGooglePopup();
      router.push("/dashboard"); // adjust based on role
    } catch (err: any) {
      setError(err.message || "Google signup failed");
      router.push("/auth/login"); // redirect to login on error
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create a New Account
        </h1>

        <AuthForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={handleEmailSignup}
          error={error}
          submitText="Sign Up"
        />

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <GoogleButton onClick={handleGoogleSignup} />

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

