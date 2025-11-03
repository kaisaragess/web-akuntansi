"use client";

import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import { useRouter } from "next/navigation";
import AuthGuard from "@/app/components/AuthGuard/page";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller";

// --- INTERFACE ---

interface Entry {
  id_coa: number;
  code_account: string;
  debit: string; 
  credit: string;
}

interface Journal {
  id: number;
  date: string; // Asumsi ISO String
  description: string;
  referensi: string;
  lampiran: string;
  nomor_bukti: string;
  entries: Entry[];
}

interface Coa {
  id: number;
  code_account: string;
  account: string; 
  jenis: string;
  normal_balance: string;
}

interface AggregatedAccount {
  code_account: string;
  account_name: string; 
  total: number;
}

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueAccounts: AggregatedAccount[];
  expenseAccounts: AggregatedAccount[];
}

// --- KOMPONEN ---

const LostProfitReportPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [coa, setCoa] = useState<Coa[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); 
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const router = useRouter();

  // --- Fungsi Helper ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- Fetch Data ---
  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Tidak ada token, mengalihkan ke login...");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const axiosCaller = new AxiosCaller("http://localhost:3001");

      const [journalRes, coaRes] = await Promise.all([
        axiosCaller.call["GET /journals"]({
          headers: { authorization: token },
          query: { limit: 9999 }
        }),
        axiosCaller.call["GET /coa"]({
          headers: { authorization: token },
          query: { limit: 9999 }
        })
      ]);

      // Validasi Jurnal
      if (journalRes && Array.isArray(journalRes)) {
        setJournals(journalRes as unknown as Journal[]);
      } else {
        console.error("Data Jurnal tidak valid:", journalRes);
        setJournals([]);
        throw new Error("Data jurnal yang diterima dari server tidak valid.");
      }

      // Validasi Coa
      if (coaRes && Array.isArray(coaRes)) {
        setCoa(coaRes as Coa[]);
      } else {
        console.error("Data Coa tidak valid:", coaRes);
        setCoa([]);
        throw new Error("Data Coa (Chart of Accounts) yang diterima dari server tidak valid.");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data awal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]); 

  useEffect(() => {
    fetchInitialData(); 
  }, [fetchInitialData]); 

  // --- Fungsi Print ---
  const handlePrint = () => {
    window.print();
  };


  // --- FUNGSI ALGORITMA LABA RUGI ---
  const handleShowReport = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error
    setReportData(null); // Reset data lama

    if (!selectedPeriod) {
      alert("Silakan pilih periode terlebih dahulu.");
      return;
    }
    if (journals.length === 0 || coa.length === 0) { 
      alert("Data jurnal atau Coa belum siap.");
      return;
    }

    try {
      // Buat Map untuk lookup nama akun
      const coaNameMap = new Map<string, string>();
      for (const account of coa) {
        coaNameMap.set(account.code_account, account.account);
      }
      
      const [year, month] = selectedPeriod.split('-');

      // Filter Jurnal berdasarkan periode
      const filteredJournals = journals.filter(journal => {
        const journalDate = new Date(journal.date);
        if (isNaN(journalDate.getTime())) return false; // Skip invalid date
        const journalYear = journalDate.getFullYear().toString();
        const journalMonth = (journalDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        return journalYear === year && journalMonth === month;
      });

      // Agregasi data
      const revenueMap = new Map<string, number>(); // <code_account, total_kredit>
      const expenseMap = new Map<string, number>(); // <code_account, total_debit>

      for (const journal of filteredJournals) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          
          // Logika Pendapatan (Awalan 4)
          if (code.startsWith('4')) {
            const creditAmount = parseFloat(entry.credit) || 0;
            const debitAmount = parseFloat(entry.debit) || 0; // Perhitungkan debit jika ada retur dll
            const currentTotal = revenueMap.get(code) || 0;
            revenueMap.set(code, currentTotal + (creditAmount - debitAmount));
          }
          
          // Logika Biaya/Beban (Awalan 5)
          if (code.startsWith('5')) {
            const debitAmount = parseFloat(entry.debit) || 0;
            const creditAmount = parseFloat(entry.credit) || 0; // Perhitungkan kredit jika ada koreksi dll
            const currentTotal = expenseMap.get(code) || 0;
            expenseMap.set(code, currentTotal + (debitAmount - creditAmount));
          }
        }
      }

      // Hitung Total
      let totalRevenue = 0;
      const revenueAccounts: AggregatedAccount[] = [];
      revenueMap.forEach((total, code) => {
        if (total !== 0) { // Hanya tampilkan akun dengan saldo
             revenueAccounts.push({
                 code_account: code,
                 account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
                 total
             });
             totalRevenue += total;
        }
      });

      let totalExpenses = 0;
      const expenseAccounts: AggregatedAccount[] = [];
      expenseMap.forEach((total, code) => {
          if (total !== 0) { // Hanya tampilkan akun dengan saldo
             expenseAccounts.push({
                 code_account: code,
                 account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
                 total
             });
             totalExpenses += total;
          }
      });

      const netProfit = totalRevenue - totalExpenses;

      // Simpan hasil ke state
      setReportData({
        totalRevenue,
        totalExpenses,
        netProfit,
        revenueAccounts,
        expenseAccounts
      });
    } catch (err) {
        console.error("Gagal menghitung laporan L/R:", err);
        setError(err instanceof Error ? err.message : "Terjadi error saat kalkulasi laporan Laba Rugi.");
        setReportData(null);
    }
  };

  // --- RENDER ---

  return (
    <AuthGuard>
    <>
      {/* --- CSS Print --- */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan elemen yang tidak perlu */
          .no-print {
            display: none !important;
          }
          /* Atur layout body untuk print */
          body {
            margin: 0;
            padding: 0;
          }
          /* Pastikan area print mengisi halaman */
          .printable-report {
            visibility: visible !important; /* Paksa terlihat */
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20mm; /* Margin halaman cetak */
            border: none;
            box-shadow: none;
            font-size: 12pt;
            color: black;
            background-color: white !important; /* Paksa background putih */
            page-break-inside: avoid; /* Coba cegah terpotong */
          }
          .printable-report * {
            visibility: visible !important;
            color: black !important;
            background-color: transparent !important;
            box-shadow: none !important; /* Hapus shadow */
            border-color: #ccc !important; /* Warna border standar */
          }
          /* Aturan tambahan */
          table, tr, td, h2, h3, p {
            page-break-inside: avoid;
          }
          h2, h3 {
            page-break-after: avoid;
          }
          * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
          }
        }
      `}</style>
      {/* --- AKHIR CSS --- */}

      {/* --- DIUBAH: Tambahkan class 'no-print' ke elemen yang tidak ingin dicetak --- */}
    <div className="flex min-h-screen pt-14">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu/>  
        
        <main className={`flex-1 p-6 bg-gray-100`}>
          <div className="flex justify-between items-center mb-6 no-print"> {/* Sembunyikan header saat print */}
            <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Laporan Laba Rugi
          </h1>
        </div>
            {reportData && (
              <button
                onClick={handlePrint}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors print-button no-print"
              >
                Cetak PDF
              </button>
            )}
          </div>


          <form onSubmit={handleShowReport} className="bg-white p-6 rounded-lg shadow-md mb-6 report-form no-print">
            <h2 className="text-xl font-bold mb-4">Pilih Periode Laporan</h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="periode">Periode:</label>
              <input
                id="periode"
                type="month"
                className="border border-gray-300 rounded p-2 w-full max-w-xs"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Memuat data..." : "Tampilkan Laporan"}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>

          {/* --- Area Laporan Laba Rugi --- */}
          {reportData && (
            <div 
              id="laporan-laba-rugi"
              className="printable-report bg-white p-6 sm:p-10 rounded-lg shadow-md max-w-3xl mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">HSEO GROUP</h2> {/* Ganti Nama Perusahaan */}
                <h2 className="text-xl font-bold mb-1">Laporan Laba Rugi</h2>
                <h3 className="text-lg">Untuk Periode yang Berakhir pada {selectedPeriod}</h3>
              </div>

              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left font-bold p-2">Keterangan</th>
                    <th className="text-right font-bold p-2">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Pendapatan */}
                  <tr>
                    <td className="p-2 pt-4 font-bold" colSpan={2}>Pendapatan Usaha:</td>
                  </tr>
                  {reportData.revenueAccounts.length > 0 ? (
                    reportData.revenueAccounts.map((acc, index) => (
                      <tr key={`rev-${index}`}>
                        <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                        <td className="text-right p-2">{formatCurrency(acc.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="p-2 pl-6 text-gray-500 italic" colSpan={2}>Tidak ada pendapatan</td></tr>
                  )}
                  <tr className="border-t border-gray-300">
                    <td className="p-2 font-bold">Total Pendapatan</td>
                    <td className="text-right p-2 font-bold">{formatCurrency(reportData.totalRevenue)}</td>
                  </tr>

                  {/* Beban */}
                  <tr>
                    <td className="p-2 pt-4 font-bold" colSpan={2}>Beban Operasi:</td>
                  </tr>
                   {reportData.expenseAccounts.length > 0 ? (
                    reportData.expenseAccounts.map((acc, index) => (
                      <tr key={`exp-${index}`}>
                        <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                        <td className="text-right p-2">{formatCurrency(acc.total)}</td>
                      </tr>
                    ))
                   ) : (
                     <tr><td className="p-2 pl-6 text-gray-500 italic" colSpan={2}>Tidak ada beban</td></tr>
                   )}
                  <tr className="border-t border-gray-300">
                    <td className="p-2 font-bold">Total Beban</td>
                    <td className="text-right p-2 font-bold">({formatCurrency(reportData.totalExpenses)})</td>
                  </tr>

                  {/* Laba Bersih */}
                  <tr className="border-t-2 border-gray-400 mt-2">
                    <td className="p-2 pt-4 font-bold">{reportData.netProfit >= 0 ? "Laba Bersih" : "Rugi Bersih"}</td>
                    <td className={`p-2 pt-4 font-bold text-right ${reportData.netProfit >= 0 ? '' : 'text-red-600'}`}>
                        {reportData.netProfit >= 0
                            ? formatCurrency(reportData.netProfit)
                            : `(${formatCurrency(Math.abs(reportData.netProfit))})` // Tampilkan rugi dalam kurung
                        }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pesan jika data tidak muncul tapi tidak ada error */}
          {!loading && !error && !reportData && selectedPeriod && (
             <div className="text-center text-gray-500 mt-10">
                 Tidak ada data laporan untuk periode {selectedPeriod}.
             </div>
          )}
        </main>
      </div>
      </div>
    </>
    </AuthGuard>
  );
};

export default LostProfitReportPage; 

