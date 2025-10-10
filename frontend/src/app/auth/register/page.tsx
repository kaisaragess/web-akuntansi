"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

const RegisterPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    password: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!form.fullname || !form.username || !form.password ) {
      setError("Semua field wajib diisi!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await new AxiosCaller("http://localhost:3001").call["POST /register"]({
        body: { ...form },
      });

      if (res.user) {
        alert("Register berhasil!");
        router.push("/auth/login");
      } else {
        setError("User tidak valid!");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        className="relative bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4 text-black border border-gray-400"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Register Page</h1>

        <input
          name="fullname"
          placeholder="Fullname"
          onChange={handleChange}
          value={form.fullname}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={form.username}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <p className="text-center text-gray-600 mt-1 text-sm">
          Sudah punya akun?{" "}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Login disini
          </a>
        </p>
      </form>
    </div>
      <Footer />  
      </>
  );
};

export default RegisterPage;
