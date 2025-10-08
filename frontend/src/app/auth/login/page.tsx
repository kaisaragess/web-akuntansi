"use client";

import { useState } from "react";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Semua field wajib diisi!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setLoading(true);
      const res = await new AxiosCaller("http://localhost:3001").call[
        "POST /login"
      ]({
        body: {
          username: form.username,
          password: form.password,
        },
      });

      if (res.user) {
        alert("Login berhasil!");
        router.push("/user/dashboard");
      } else {
        setError("Password atau Username Salah!");
      }
    } catch (err: any) {
      alert("Login gagal, cek username/password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <Navbar />
      <div
        className="relative flex justify-center items-center min-h-screen bg-center bg-cover"
        style={{ backgroundImage: `url('/bgrl.jpg')` }}
      >
        {/* overlay redup */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* form */}
        <form 
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-gray-700 border border-gray-400">
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            Login Page
          </h2>

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Belum punya akun?{" "}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Daftar disini
            </a>
          </p>
        </form>
      </div>
      {/* <Footer /> */}
      <Footer />
    </>
  );
};

export default LoginPage;
