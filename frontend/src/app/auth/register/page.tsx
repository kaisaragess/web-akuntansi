"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

const RegisterPage = () => {
  // --- Inisialisasi router untuk navigasi halaman ---
  const router = useRouter();

  // --- State untuk menyimpan input form registrasi ---
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // --- State untuk loading indicator dan pesan error ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * 🔹 handleChange()
   * Fungsi untuk memperbarui nilai form setiap kali user mengetik.
   * Menggunakan nama atribut input (name) sebagai kunci state.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * 🔹 handleSubmit()
   * Fungsi yang dijalankan saat user menekan tombol "Register".
   * Melakukan beberapa langkah:
   * 1. Validasi input form (field wajib, panjang password, kecocokan password).
   * 2. Mengirim data ke server menggunakan AxiosCaller.
   * 3. Menampilkan pesan sukses atau error sesuai hasil response.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Validasi input wajib diisi ---
    if (
      !form.fullname ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Semua field wajib diisi!");
      return;
    }

    // --- Validasi panjang password ---
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    // --- Validasi kesamaan password ---
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    // --- Jika semua validasi lolos ---
    setError("");
    setLoading(true);

    try {
      // Kirim data registrasi ke server (endpoint /register)
      const res = await new AxiosCaller("http://localhost:3001").call[
        "POST /register"
      ]({
        body: { ...form },
      });

      console.log("Register response:", res);

      // Jika response sukses
      if (res) {
        alert("Register berhasil!");
        router.push("/auth/login");
      } else {
        setError("User tidak valid!");
      }
    } catch (err: any) {
      // Jika terjadi error saat koneksi / validasi server
      setError(err.message || "Terjadi kesalahan");
    } finally {
      // Matikan indikator loading
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Navbar ===== */}
      <Navbar />

      {/* ===== Background dan Form Registrasi ===== */}
      <div
        className="relative flex justify-center items-center min-h-screen bg-center bg-cover"
        style={{ backgroundImage: `url('/bgrl.jpg')` }}
      >
        {/* Overlay gelap agar form lebih fokus */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* ===== Form Registrasi ===== */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white p-6 mx-10 rounded-2xl shadow-lg w-full max-w-sm space-y-4 text-black border border-gray-400"
        >
          <h1 className="text-2xl font-bold text-center mb-4">
            Register Page
          </h1>

          {/* Input Fullname */}
          <input
            name="fullname"
            placeholder="Fullname"
            onChange={handleChange}
            value={form.fullname}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Input Username */}
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Input Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Input Konfirmasi Password */}
          <input
            name="confirmPassword"
            type="password"
            placeholder="Konfirmasi Password"
            onChange={handleChange}
            value={form.confirmPassword}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Register"}
          </button>

          {/* Pesan Error jika ada */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Navigasi ke halaman login */}
          <p className="text-center text-gray-600 mt-1 text-sm">
            Sudah punya akun?{" "}
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Login disini
            </a>
          </p>
        </form>
      </div>

      {/* ===== Footer ===== */}
      <Footer />
    </>
  );
};

export default RegisterPage;