"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar/page";
import Footer from "@/app/components/Footer/page";

const HomePage = () => {
  return (
    <>
    <Navbar />
      <div>
        <div
          className="relative flex items-center justify-end w-full min-h-screen bg-center bg-cover"
          style={{ backgroundImage: `url('/bg.jpg')` }}
        >
          <div className=" max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Kelola Keuangan Bisnis Lebih Mudah dengan Kasku
            </h1>
            <p className="text-lg">
              Kasku adalah solusi akuntansi berbasis web yang membantu Anda mencatat transaksi, mengelola laporan keuangan, dan memantau arus kas secara real-time.
            </p>
            <br />
            <Link
              type="submit"
              href="/auth/register"
              className=" px-14 py-2 font-semibold text-white  bg-lime-600 rounded hover:bg-lime-800"
            >
              Daftar Sekarang!
            </Link>
          </div>
        </div>
<div className="px-6 py-20 relative flex items-center justify-end w-full min-h-screen bg-gray-300">
  <div className="grid items-center gap-12 mx-auto max-w-7xl md:grid-cols-2">
    <div>
      <Link href="/">
        <div className=" text-black shadow-lg hover:scale-105 transition cursor-pointer">
          <img src="/pict1.jpg" alt="Kasku Accounting" />
        </div>
      </Link>
    </div>
    <div>
      <h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">
        Kelola Keuangan Lebih Mudah dengan Kasku
      </h2>
      <p className="mb-4 leading-relaxed text-black">
        Kasku adalah platform akuntansi berbasis web yang membantu bisnis Anda 
        mencatat transaksi, membuat laporan keuangan, dan memantau arus kas 
        secara real-time tanpa ribet.
      </p>
      <p className="leading-relaxed text-black">
        Dengan antarmuka yang sederhana, fitur lengkap, dan keamanan data 
        terjamin, Kasku cocok digunakan oleh perusahaan untuk 
        mengelola keuangan lebih efisien dan transparan.
      </p>
    </div>
  </div>
</div>

      </div>
      <Footer />
    </>
  );
};

export default HomePage;
