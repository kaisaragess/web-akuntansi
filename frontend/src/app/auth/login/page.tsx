"use client";

import { useState } from "react";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

const LoginPage = () => {
  // --- Hook untuk routing antar halaman ---
  const router = useRouter();

  // --- State untuk menyimpan nilai input username dan password ---
  const [form, setForm] = useState({ username: "", password: "" });

  // --- State untuk indikator loading saat proses login berlangsung ---
  const [loading, setLoading] = useState(false);

  // --- State untuk menampilkan pesan error validasi ---
  const [error, setError] = useState("");

  /**
   * 🔹 handleChange()
   * Fungsi untuk menangani perubahan nilai input (username & password)
   * Secara otomatis memperbarui state form setiap kali user mengetik.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * 🔹 handleSubmit()
   * Fungsi untuk mengirim form login.
   * - Validasi input agar tidak kosong.
   * - Kirim permintaan POST ke endpoint /login menggunakan AxiosCaller.
   * - Jika sukses: simpan token & user info ke localStorage, lalu redirect.
   * - Jika gagal: tampilkan pesan error.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: semua field wajib diisi
    if (!form.username || !form.password) {
      setError("Semua field wajib diisi!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Panggil API login
      const res = await new AxiosCaller("http://localhost:3001").call[
        "POST /login"
      ]({
        body: {
          username: form.username,
          password: form.password,
        },
      });

      // Jika berhasil, simpan token dan data user ke localStorage
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("fullname", res.user.fullname);
        localStorage.setItem("username", res.user.username);
        alert("Login berhasil!");

        // Arahkan ke halaman dashboard
        router.push("/user/dashboard");
      } else {
        setError("Password atau Username Salah!");
      }
    } catch (err: any) {
      // Tampilkan pesan error jika login gagal
      alert("Login gagal, cek username/password!");
    } finally {
      // Matikan indikator loading
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Navbar ===== */}
      <Navbar />

      {/* ===== Background dengan form login di tengah ===== */}
      <div
        className="relative flex justify-center items-center min-h-screen bg-center bg-cover"
        style={{ backgroundImage: `url('/bgrl.jpg')` }}
      >
        {/* Lapisan overlay gelap agar teks terlihat jelas */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* ===== Form Login ===== */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white p-8 mx-10 rounded-2xl shadow-lg w-full max-w-sm text-gray-700 border border-gray-400"
        >
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            Login Page
          </h2>

          {/* Input Username */}
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Input Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          {/* Link ke halaman register */}
          <p className="text-center text-gray-600 mt-4 text-sm">
            Belum punya akun?{" "}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Daftar disini
            </a>
          </p>

          {/* Pesan Error */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}
        </form>
      </div>

      {/* ===== Footer ===== */}
      <Footer />
    </>
  );
};

export default LoginPage;