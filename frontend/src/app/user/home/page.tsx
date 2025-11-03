/**
 * @file HomePage.tsx
 * @description Halaman utama aplikasi "Kasku" yang menampilkan hero section,
 * fitur utama, dan bagian tentang aplikasi. Halaman ini menggunakan animasi
 * dari Framer Motion serta komponen Navbar dan Footer.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AiOutlineTransaction, AiOutlineFileText, AiOutlineBarChart } from "react-icons/ai";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

/**
 * Komponen utama halaman beranda aplikasi.
 * Menampilkan beberapa section:
 * - Hero Section (promosi utama)
 * - Features Section (fitur unggulan)
 * - About Section (penjelasan singkat aplikasi)
 */
const HomePage = () => {
  /**
   * Array fitur utama aplikasi.
   * Berisi judul, deskripsi, dan ikon yang akan ditampilkan
   * dalam bagian fitur di halaman.
   */
  const features = [
    {
      title: "Transaksi Otomatis",
      desc: "Catat semua transaksi secara real-time tanpa repot, cukup klik dan selesai.",
      icon: <AiOutlineTransaction className="w-12 h-12 text-green-500 mb-4" />,
    },
    {
      title: "Laporan Lengkap",
      desc: "Buat laporan keuangan profesional dengan mudah dan cepat.",
      icon: <AiOutlineFileText className="w-12 h-12 text-green-500 mb-4" />,
    },
    {
      title: "Pantau Arus Kas",
      desc: "Cek cash flow harian, mingguan, dan bulanan dalam satu dashboard.",
      icon: <AiOutlineBarChart className="w-12 h-12 text-green-500 mb-4" />,
    },
  ];

  return (
    <>
      {/* === Navbar === */}
      <Navbar />

      {/* === Hero Section === */}
      {/* Bagian utama halaman dengan background gambar dan animasi teks */}
      <section className="relative flex items-center justify-end min-h-screen bg-cover bg-center bg-[url('/bg.jpg')]" >
        <div className="max-w-2xl text-right px-6 sm:px-12">
          {/* Judul utama dengan animasi fade-in */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg mb-6 leading-tight"
          >
            Keuangan Terkelola, Bisnis Lebih Lancar dengan{" "}
            <span className="text-green-400">Kasku</span>
          </motion.h1>

          {/* Deskripsi singkat aplikasi */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-base sm:text-lg text-gray-100 mb-8 leading-relaxed"
          >
            Semua transaksi, laporan keuangan, dan arus kas bisnis Anda dapat 
            dimonitor dengan mudah dalam satu platform terintegrasi.
          </motion.p>

          {/* Tombol CTA (Call To Action) dengan animasi pulse */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <Link
              href="/auth/register"
              className="inline-block px-12 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Mulai Gratis Sekarang
            </Link>
          </motion.div>
        </div>
      </section>

      {/* === Features Section === */}
      {/* Menampilkan fitur unggulan aplikasi dalam bentuk card */}
      <section className="bg-green-200 py-24 overflow-hidden text-gray-800" id="about">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === About Section === */}
      {/* Penjelasan singkat mengenai keunggulan aplikasi Kasku */}
      <section id="about" className="bg-gray-100 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-6">
          {/* Gambar ilustrasi dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="shadow-lg rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <img
              src="/image.png"
              alt="Dashboard Kasku"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Teks penjelasan aplikasi */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Akuntansi Mudah dan Interaktif
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Nikmati pengalaman pengelolaan keuangan bisnis yang lebih cepat, rapi, 
              dan transparan. Semua data Anda tersimpan aman di cloud.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Dari transaksi harian hingga laporan bulanan, <span className="font-medium text-gray-800">Kasku</span> membuat 
              setiap langkah lebih mudah dan efisien.
            </p>
          </motion.div>
        </div>
      </section>

      {/* === Footer === */}
      <Footer />
    </>
  );
};

export default HomePage;