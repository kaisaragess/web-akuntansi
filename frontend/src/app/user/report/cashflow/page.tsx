"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import Image from "next/image";
import AuthGuard from "@/app/components/AuthGuard/page";
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller";

const ArusKasPage = () => {
interface Entry {
  id: number;
  id_journal: number;
  id_coa: number;
  code_account: string;
  debit: number;
  credit: number;
}

interface Journal {
  id: number;
  date: string;
  description: string;
  entries: Entry[];
}

interface Coa {
  id: number;
  code_account: string;
  account: string;
}

  const [arusKas, setArusKas] = useState<{ tanggal: string; deskripsi: string; debit: number; credit: number }[]>([]);
  const [totalMasuk, setTotalMasuk] = useState(0);
  const [totalKeluar, setTotalKeluar] = useState(0);
  const [isloading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🗓️ filter tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchArusKas();
  }, []);

  const fetchArusKas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const axiosClient = new AxiosCaller("http://localhost:3001");

      // Ambil semua jurnal
      const journalsRes = await axiosClient.call["GET /journals"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });
      const journals = journalsRes as unknown as Journal[];

      // Ambil daftar COA
      const coaRes = await axiosClient.call["GET /coa"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });
      const coaList = coaRes as unknown as Coa[];

      // Filter akun kas & bank (1xx)
      const kasBankAccounts = coaList.filter((c) =>
        c.code_account.startsWith("1")
      );

      // Gabungkan jurnal dan entri untuk akun kas/bank saja
      let kasEntries = journals.flatMap((journal) =>
        journal.entries
          .filter((e) =>
            kasBankAccounts.some((coa) => coa.code_account === e.code_account)
          )
          .map((e) => ({
            tanggal: journal.date,
            deskripsi: journal.description,
            debit: Number(e.debit) || 0,
            credit: Number(e.credit) || 0,
          }))
      );

      // 🔍 Filter berdasarkan tanggal jika ada input
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        kasEntries = kasEntries.filter((item) => {
          const tgl = new Date(item.tanggal);
          return tgl >= start && tgl <= end;
        });
      }

      // Hitung total masuk & keluar
      const masuk = kasEntries.reduce((sum, e) => sum + e.debit, 0);
      const keluar = kasEntries.reduce((sum, e) => sum + e.credit, 0);

      setArusKas(kasEntries);
      setTotalMasuk(masuk);
      setTotalKeluar(keluar);
    } catch (error) {
      console.error("Gagal mengambil arus kas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === EXPORT FUNCTIONS ===
  const handleExportPDF = () => {
    const content = document.getElementById("arus-kas-content");
    if (!content) return;
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Laporan Arus Kas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #444; padding: 6px 8px; font-size: 12px; }
            th { background: #eee; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Laporan Arus Kas</h2>
          ${content.innerHTML}
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
  };

  const handleExportExcel = () => {
    const content = document.getElementById("arus-kas-content");
    if (!content) return;
    const html = content.innerHTML;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan_arus_kas.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDoc = () => {
    const content = document.getElementById("arus-kas-content");
    if (!content) return;
    const html = `
      <html><head><meta charset="utf-8"></head><body>
      <h2>Laporan Arus Kas</h2>${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan_arus_kas.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
    <div className="flex min-h-screen pt-14">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu/>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Laporan Arus Kas
          </h1>

          {/* Dropdown export */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-white px-3 py-1 rounded hover:bg-stone-200 text-sm"
            >
              <Image src="/printer.png" alt="Print Icon" width={30} height={30} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    handleExportPDF();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <Image src="/pdf-file.png" alt="PDF" width={18} height={18} />
                  PDF
                </button>
                <button
                  onClick={() => {
                    handleExportDoc();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <Image src="/document.png" alt="Doc" width={18} height={18} />
                  Word
                </button>
                <button
                  onClick={() => {
                    handleExportExcel();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <Image src="/excel.png" alt="Excel" width={18} height={18} />
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🔍 Filter tanggal */}
        <div className="flex items-center gap-3 mb-4">
          <div>
            <label className="text-sm mr-2 font-semibold">Mulai Dari:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm mr-2 font-semibold">Sampai Dengan:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={fetchArusKas}
            className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
          >
            Tampilkan
          </button>
        </div>

        {isloading ? (
          <p className="text-gray-500">Memuat data arus kas...</p>
        ) : (
          <div
            id="arus-kas-content"
            className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden p-4"
          >
            <table className="w-full text-sm border-collapse">
              <thead className="bg-stone-800 text-green-200">
                <tr>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Deskripsi</th>
                  <th className="px-4 py-2 text-right">Kas Masuk (Debit)</th>
                  <th className="px-4 py-2 text-right">Kas Keluar (Kredit)</th>
                </tr>
              </thead>
              <tbody>
                {arusKas.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2">{item.deskripsi}</td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {item.debit ? item.debit.toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600">
                      {item.credit ? item.credit.toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-100 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-right">
                    Total
                  </td>
                  <td className="px-4 py-2 text-right text-green-600">
                    {totalMasuk.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-red-600">
                    {totalKeluar.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-green-200">
                  <td colSpan={2} className="px-4 py-2 text-right">
                    <strong>Arus Kas Neto</strong>
                  </td>
                  <td colSpan={2} className="px-4 py-2 text-right font-bold">
                    {(totalMasuk - totalKeluar).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p className="mt-3 text-xs text-gray-500 italic text-center">
              * Arus Kas Neto = Kas Masuk - Kas Keluar (berdasarkan akun Kas & Bank)
            </p>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
};

export default ArusKasPage;
