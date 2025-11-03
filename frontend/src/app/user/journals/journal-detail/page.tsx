/**
 * @file JournalDetail.tsx
 * @description Halaman untuk menampilkan detail seluruh jurnal beserta entri akunnya.
 * Komponen ini menampilkan data dari API /journals dan /coa, lalu menggabungkan keduanya
 * agar setiap entri jurnal memiliki nama akun dan kode akun dari COA.
 */


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller";

/**
 * Komponen utama untuk halaman Detail Jurnal.
 * Menampilkan daftar semua jurnal (dari API backend) dengan COA terhubung.
 */

const JournalDetail = () => {
    /**
   * Interface untuk struktur data Entry (entri jurnal).
   * Setiap entri memiliki id akun, kode akun, nama akun, debit, dan kredit.
   */

  interface Entry {
    id_coa: number;
    code_account: string;
    account: string;
    debit: string;
    credit: string;
  }

    /**
   * Interface untuk struktur data Journal.
   * Berisi informasi utama jurnal seperti tanggal, deskripsi, referensi, lampiran, dan daftar entry.
   */

  interface Journal {
    id: number;
    date: string;
    description: string;
    referensi: string;
    lampiran: string;
    nomor_bukti: string;
    entries: Entry[];
  }

  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  /**
   * 🔹 Fungsi untuk mengambil semua data jurnal dan COA dari backend,
   * lalu menggabungkannya agar tiap entri jurnal punya nama akun dan kode akun.
   */
  const fetchJournals = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);

            // Ambil data jurnal dari endpoint /journals
      const journalRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /journals"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      const coaRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /coa"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      /**
       * Buat peta (map) untuk menghubungkan id_coa dengan nama dan kode akun.
       * Ini akan memudahkan penggabungan antara data jurnal dan COA.
       */
      const coaMap = new Map<
        number,
        { account: string; code_account: string }
      >();
      coaRes.forEach((c: any) => {
        coaMap.set(c.id, { account: c.account, code_account: c.code_account });
      });

      /**
       * Gabungkan data COA dengan entries di setiap jurnal.
       * Setiap entry akan mendapatkan nama akun dan kode akun dari coaMap.
       */
      const merged = (journalRes as any[]).map((journal) => ({
        ...journal,
        entries: journal.entries.map((entry: any) => ({
          ...entry,
          account: coaMap.get(entry.id_coa)?.account || "-",
          code_account:
            coaMap.get(entry.id_coa)?.code_account || entry.code_account,
        })),
      }));

      setJournals(merged as Journal[]);
    } catch (err) {
      console.error("Gagal ambil data jurnal:", err);
      setError("Gagal memuat data jurnal");
    } finally {
      setLoading(false);
    }
  };

    /**
   * 🔹 useEffect()
   * Dipanggil saat komponen pertama kali dimuat untuk mengambil data jurnal.
   */
  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div className="flex min-h-screen pt-15">
            {/* Sidebar dan Navbar tetap ditampilkan */}
      <Sidebar />
      <Navbar hideMenu />

      {/* === MAIN CONTENT === */}
      <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Detail Semua Jurnal
          </h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari akun atau deskripsi..."
              className="border border-gray-400 rounded-lg w-64 pl-5 p-2 focus:ring-2 focus:ring-green-400 focus:outline-none placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => router.push("/user/journals")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

{/* === Tabel Data Jurnal === */}
        <div className="overflow-x-auto overflow-visible relative bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-lg border border-green-100">
          <table className="min-w-full text-sm text-black rounded-xl relative z-0">
            <thead>
              <tr className="bg-stone-900 border-b border-green-200 text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Kode Akun
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Account
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Kredit
                </th>
              </tr>
            </thead>
            <tbody>
               {/* Gabungkan semua jurnal ke dalam 1 daftar entry */}
              {journals
                .flatMap((journal) =>
                  journal.entries.map((entry) => ({
                    ...entry,
                    date: journal.date,
                    description: journal.description,
                  }))
                )
                 // Filter pencarian berdasarkan akun, deskripsi, atau kode akun
                .filter(
                  (e) =>
                    e.account
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    e.description
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    e.code_account
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                // Render hasil ke tabel
                .map((entry, i) => (
                  <tr
                    key={i}
                    className="border-t border-green-100 hover:bg-green-50 transition-all duration-200"
                  >
                    <td className="px-4 py-2 text-left">{entry.date}</td>
                    <td className="px-4 py-2 text-left">{entry.code_account}</td>
                    <td className="px-4 py-2 text-left">{entry.account}</td>
                    <td className="px-4 py-2 text-left">{entry.description || "-"}</td>
                    <td className="px-4 py-2 text-left text-green-600 font-semibold">
                      {entry.debit}
                    </td>
                    <td className="px-4 py-2 text-left text-red-600 font-semibold">
                      {entry.credit}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pesan loading atau error */}
        {loading && (
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        )}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </main>
    </div>
  );
};

export default JournalDetail;
