"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Footer from "@/app/components/Footer/page";

// --- INTERFACE/TIPE DATA ---
interface COA {
  kodeAkun: string;
  namaAkun: string;
  saldoNormal: "Debit" | "Kredit";
}

interface BukuBesarEntry {
  id: number;
  tanggal: string;
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
  deskripsi: string;
}

interface CalculatedEntry extends BukuBesarEntry {
  saldoDebit: number;
  saldoKredit: number;
}

// --- DATA SIMULASI COA ---
const COA_DATA: COA[] = [
  { kodeAkun: "101", namaAkun: "Kas", saldoNormal: "Debit" },
  { kodeAkun: "102", namaAkun: "Piutang Usaha", saldoNormal: "Debit" },
  { kodeAkun: "201", namaAkun: "Utang Usaha", saldoNormal: "Kredit" },
  { kodeAkun: "301", namaAkun: "Modal", saldoNormal: "Kredit" },
  { kodeAkun: "401", namaAkun: "Pendapatan Jasa", saldoNormal: "Kredit" },
  { kodeAkun: "501", namaAkun: "Beban Gaji", saldoNormal: "Debit" },
];

// --- DATA SIMULASI JURNAL UMUM ---
const DUMMY_JURNAL_UMUM: BukuBesarEntry[] = [
  { id: 1, tanggal: "2025-10-01", kode_akun: "101", nama_akun: "Kas", debit: 1000000, kredit: 0, deskripsi: "Setoran Modal Awal" },
  { id: 2, tanggal: "2025-10-01", kode_akun: "301", nama_akun: "Modal", debit: 0, kredit: 1000000, deskripsi: "Setoran Modal Awal" },
  { id: 3, tanggal: "2025-10-02", kode_akun: "101", nama_akun: "Kas", debit: 0, kredit: 200000, deskripsi: "Pembelian Alat Tulis" },
  { id: 4, tanggal: "2025-10-02", kode_akun: "501", nama_akun: "Beban Gaji", debit: 200000, kredit: 0, deskripsi: "Pembelian Alat Tulis" },
  { id: 5, tanggal: "2025-10-03", kode_akun: "101", nama_akun: "Kas", debit: 500000, kredit: 0, deskripsi: "Penerimaan Pelanggan" },
  { id: 6, tanggal: "2025-10-03", kode_akun: "401", nama_akun: "Pendapatan Jasa", debit: 0, kredit: 500000, deskripsi: "Penerimaan Pelanggan" },
  { id: 7, tanggal: "2025-10-04", kode_akun: "201", nama_akun: "Utang Usaha", debit: 0, kredit: 500000, deskripsi: "Beli barang dagang kredit" },
  { id: 8, tanggal: "2025-10-05", kode_akun: "201", nama_akun: "Utang Usaha", debit: 300000, kredit: 0, deskripsi: "Bayar utang sebagian" },
  { id: 9, tanggal: "2025-10-06", kode_akun: "101", nama_akun: "Kas", debit: 200000, kredit: 0, deskripsi: "Tambahan setoran" },
  { id: 10, tanggal: "2025-10-07", kode_akun: "101", nama_akun: "Kas", debit: 150000, kredit: 0, deskripsi: "Penerimaan lainnya" },
];

const BukuBesarPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataBukuBesar, setDataBukuBesar] = useState<BukuBesarEntry[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedAkun, setSelectedAkun] = useState<COA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // === Sidebar & Data ===
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      setDataBukuBesar(DUMMY_JURNAL_UMUM);
      setIsLoading(false);
    }, 800);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // === Fungsi Cari Akun ===
  const handleSearchAccount = () => {
    if (searchInput.trim() === "") {
      setSelectedAkun(null);
      return;
    }

    const foundAkun = COA_DATA.find(
      (akun) =>
        akun.kodeAkun.toLowerCase() === searchInput.trim().toLowerCase() ||
        akun.namaAkun.toLowerCase().includes(searchInput.trim().toLowerCase())
    );

    if (foundAkun) {
      setSelectedAkun(foundAkun);
    } else {
      setSelectedAkun(null);
      alert(`Akun "${searchInput}" tidak ditemukan.`);
    }
  };

  // === Hitung Saldo ===
  const hitungSaldo = (data: BukuBesarEntry[], akunDetail: COA): CalculatedEntry[] => {
    if (!akunDetail || data.length === 0) return [];
    const calculatedData: CalculatedEntry[] = [];
    let saldoAkhir = 0;

    data.forEach((item) => {
      if (akunDetail.saldoNormal === "Debit") {
        saldoAkhir += item.debit - item.kredit;
      } else {
        saldoAkhir += item.kredit - item.debit;
      }

      let saldoDebit = 0;
      let saldoKredit = 0;
      if (saldoAkhir >= 0) {
        akunDetail.saldoNormal === "Debit" ? (saldoDebit = saldoAkhir) : (saldoKredit = saldoAkhir);
      } else {
        akunDetail.saldoNormal === "Debit" ? (saldoKredit = Math.abs(saldoAkhir)) : (saldoDebit = Math.abs(saldoAkhir));
      }

      calculatedData.push({ ...item, saldoDebit, saldoKredit });
    });

    return calculatedData;
  };

  const filteredData = selectedAkun
    ? dataBukuBesar.filter((item) => item.kode_akun === selectedAkun.kodeAkun)
    : [];

  const bukuBesarData = selectedAkun ? hitungSaldo(filteredData, selectedAkun) : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed md:static inset-0 z-40 md:z-0">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col">
        {/* Tombol Sidebar (Mobile) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        >
          ☰
        </button>

        {/* Konten Buku Besar */}
        <div className="flex-1 container mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md text-black mt-2 md:mt-4">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-lime-200 p-3 rounded-md text-center">
            Buku Besar
          </h1>

          {/* Search Input */}
          <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center">
            <label htmlFor="searchAkun" className="font-medium text-gray-700 whitespace-nowrap">
              Cari Akun (Kode/Nama):
            </label>
            <input
              id="searchAkun"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cth: 101 atau Kas"
              className="border border-gray-400 rounded p-2 text-sm md:text-base w-full md:w-64"
            />
            <button
              onClick={handleSearchAccount}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded transition ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Cari Akun
            </button>
          </div>

          {/* Tampilan Buku Besar */}
          {isLoading ? (
            <p className="text-center text-gray-500 italic py-6">Memuat data...</p>
          ) : !selectedAkun ? (
            <p className="text-center text-red-500 italic py-6 font-semibold">
              Silakan cari dan pilih akun untuk menampilkan Buku Besar.
            </p>
          ) : (
            <div className="bg-gradient-to-br from-lime-100 to-green-100 p-4 md:p-6 rounded-xl shadow-md border border-gray-300">
              <h2 className="text-lg font-bold mb-1 text-gray-800 text-center">
                Akun: {selectedAkun.kodeAkun} - {selectedAkun.namaAkun}
              </h2>
              <p className="text-sm text-center mb-4 text-gray-600">
                Saldo Normal: <span className="font-semibold">{selectedAkun.saldoNormal}</span>
              </p>

              {/* Tabel Scrollable */}
              <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-gray-400 rounded-lg">
                <table className="min-w-full text-sm md:text-base bg-white">
                  <thead className="bg-gray-200 text-gray-800 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="border p-2 text-left">Tanggal</th>
                      <th className="border p-2 text-left">Kode Akun</th>
                      <th className="border p-2 text-left">Deskripsi</th>
                      <th className="border p-2 text-right">Debit</th>
                      <th className="border p-2 text-right">Kredit</th>
                      <th className="border p-2 text-right bg-green-300">Saldo Debit</th>
                      <th className="border p-2 text-right bg-green-300">Saldo Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bukuBesarData.length > 0 ? (
                      bukuBesarData.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                          <td className="border p-2">{item.tanggal}</td>
                          <td className="border p-2">{item.kode_akun}</td>
                          <td className="border p-2">{item.deskripsi}</td>
                          <td className="border p-2 text-right">
                            {item.debit > 0 ? item.debit.toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="border p-2 text-right">
                            {item.kredit > 0 ? item.kredit.toLocaleString("id-ID") : "-"}
                          </td>
                          <td className={`border p-2 text-right ${item.saldoDebit > 0 ? "text-green-700 font-medium" : "text-gray-500"}`}>
                            {item.saldoDebit.toLocaleString("id-ID")}
                          </td>
                          <td className={`border p-2 text-right ${item.saldoKredit > 0 ? "text-red-700 font-medium" : "text-gray-500"}`}>
                            {item.saldoKredit.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                          Tidak ada transaksi ditemukan untuk akun ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Selalu di Bawah */}
        <div className="mt-auto">
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default BukuBesarPage;