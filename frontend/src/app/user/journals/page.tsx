"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Footer from "@/app/components/Footer/page";
import axios from "axios";

interface Jurnal {
  id: number;
  tanggal: string;
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
  deskripsi: string;
}

const JurnalUmum = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dataJurnal, setDataJurnal] = useState<Jurnal[]>([]);

  // === Sidebar Responsive ===
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // === Fetch data jurnal dari backend ===
  useEffect(() => {
    const fetchJurnal = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/jurnal", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDataJurnal(res.data);
      } catch (err) {
        console.error("Gagal memuat data jurnal umum:", err);
      }
    };
    fetchJurnal();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Tombol ☰ untuk mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
      >
        ☰
      </button>

        {/* Sidebar tampil permanen di layar besar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

      {/* Konten Utama */}
      <main className="flex-1 container mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md text-black overflow-x-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-lime-200 p-2 md:p-3 flex items-center justify-center rounded-md">
          Jurnal Umum
        </h1>

        {/* Tabel Jurnal */}
        <div className="bg-gradient-to-br from-lime-100 to-green-100 p-6 rounded-xl shadow-md border border-gray-300">
          <table className="min-w-full border border-gray-400 text-sm md:text-base bg-white">
            <thead className="bg-gray-200 text-gray-800 font-semibold">
              <tr>
                <th className="border p-2 text-left">Tanggal</th>
                <th className="border p-2 text-left">Kode Akun</th>
                <th className="border p-2 text-left">Nama Akun</th>
                <th className="border p-2 text-right">Debit</th>
                <th className="border p-2 text-right">Kredit</th>
                <th className="border p-2 text-left">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {dataJurnal.length > 0 ? (
                dataJurnal.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="border p-2">{item.tanggal}</td>
                    <td className="border p-2">{item.kode_akun}</td>
                    <td className="border p-2">{item.nama_akun}</td>
                    <td className="border p-2 text-right">
                      {item.debit
                        ? item.debit.toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td className="border p-2 text-right">
                      {item.kredit
                        ? item.kredit.toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td className="border p-2">{item.deskripsi}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-4 italic"
                  >
                    Belum ada Transaksi yang diposting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="text-center text-sm text-gray-600 mt-8">
          © 2025 Kasku.) · PT. Hseo Graha Tekno
        </footer>
      </main>
    </div>
  );
};

export default JurnalUmum;