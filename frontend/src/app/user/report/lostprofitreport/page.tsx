"use client";

import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import { useRouter } from "next/navigation";
import React, {useState, useEffect, useCallback, useRef} from "react";
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller";

interface Entry {
  id_coa: number;
  code_account: string;
  debit: string; 
  credit: string;
}

interface Journal {
  id: number;
  date: string; 
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

  const handlePrint = () => {
    window.print();
  };


  // --- FUNGSI ALGORITMA LABA RUGI ---
  const handleShowReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriod) {
      alert("Silakan pilih periode terlebih dahulu.");
      return;
    }
    if (journals.length === 0 || coa.length === 0) { 
      alert("Data jurnal atau Coa belum siap.");
      return;
    }
    
    // --- DIHAPUS: setIsReportReadyForPrint(false); ---

    const coaNameMap = new Map<string, string>();
    for (const account of coa) {
      coaNameMap.set(account.code_account, account.account);
    }

    const [year, month] = selectedPeriod.split('-');

    const filteredJournals = journals.filter(journal => {
      const parts = journal.date.split('-'); 
      const journalYear = parts[0];
      const journalMonth = parts[1];
      return journalYear === year && journalMonth === month;
    });

    const revenueMap = new Map<string, number>(); 
    const expenseMap = new Map<string, number>(); 

    for (const journal of filteredJournals) {
      for (const entry of journal.entries) {
        const code = entry.code_account;
        
        if (code.startsWith('4')) {
          const creditAmount = parseFloat(entry.credit) || 0;
          const currentTotal = revenueMap.get(code) || 0;
          revenueMap.set(code, currentTotal + creditAmount);
        }
        
        if (code.startsWith('5')) {
          const debitAmount = parseFloat(entry.debit) || 0;
          const currentTotal = expenseMap.get(code) || 0;
          expenseMap.set(code, currentTotal + debitAmount);
        }
      }
    }

    // 4. Hitung Total
    let totalRevenue = 0;
    const revenueAccounts: AggregatedAccount[] = [];
    revenueMap.forEach((total, code) => {
      revenueAccounts.push({
        code_account: code,
        account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
        total
      });
      totalRevenue += total;
    });

    let totalExpenses = 0;
    const expenseAccounts: AggregatedAccount[] = [];
    expenseMap.forEach((total, code) => {
      expenseAccounts.push({
        code_account: code,
        account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
        total
      });
      totalExpenses += total;
    });

    const netProfit = totalRevenue - totalExpenses;

    setReportData({
      totalRevenue,
      totalExpenses,
      netProfit,
      revenueAccounts,
      expenseAccounts
    });
  };

  // --- RENDER ---

  return (
    <>
      {/* --- BARU: Menambahkan CSS khusus untuk print --- */}
      <style jsx global>{`
        @media print {
          /* 1. Sembunyikan semua elemen secara default */
          body * {
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }
          /* 2. Tampilkan hanya area print dan elemen di dalamnya */
          .printable-report, .printable-report * {
            visibility: visible;
            height: auto;
            overflow: visible;
          }
          /* 3. Atur posisi area print agar mengisi halaman */
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px; /* Beri sedikit padding untuk print */
            margin: 0;
            border: none;
            box-shadow: none;
          }
          /* 4. Sembunyikan elemen UI yang tidak relevan di dalam area print (jika ada) */
          .printable-report button {
            display: none;
          }
        }
      `}</style>
      {/* --- AKHIR BARU --- */}

      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <Navbar hideMenu />
        
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
            {/* --- DIUBAH: Tampilkan tombol jika 'reportData' ada --- */}
            {reportData && (
              <button
                onClick={handlePrint} // <-- Memanggil window.print()
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Cetak PDF
              </button>
            )}
          </div>


          <form onSubmit={handleShowReport} className="bg-white p-6 rounded-lg shadow-md mb-6">
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

          {/* Area untuk menampilkan Laporan */}
          {/* --- DIUBAH: Menambahkan 'printable-report' dan menghapus 'ref' --- */}
          {reportData && (
            <div 
              id="laporan-laba-rugi"
              className="printable-report bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-bold mb-2 text-center">HSEO GROUP</h2>
              <h2 className="text-xl font-bold mb-2 text-center">Laporan Laba Rugi</h2>
              <h3 className="text-lg mb-4 text-center">Untuk Periode yang Berakhir pada {selectedPeriod}</h3>

              <table className="w-full">
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
                  {reportData.revenueAccounts.map((acc, index) => (
                    <tr key={`rev-${index}`}>
                      <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                      <td className="text-right p-2">{formatCurrency(acc.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td className="p-2 font-bold">Total Pendapatan</td>
                    <td className="text-right p-2 font-bold">{formatCurrency(reportData.totalRevenue)}</td>
                  </tr>

                  {/* Beban */}
                  <tr>
                    <td className="p-2 pt-4 font-bold" colSpan={2}>Beban Operasi:</td>
                  </tr>
                  {reportData.expenseAccounts.map((acc, index) => (
                    <tr key={`exp-${index}`}>
                      <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                      <td className="text-right p-2">{formatCurrency(acc.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td className="p-2 font-bold">Total Beban</td>
                    <td className="text-right p-2 font-bold">({formatCurrency(reportData.totalExpenses)})</td>
                  </tr>

                  {/* Laba Bersih */}
                  <tr className="border-t-2 border-gray-400 mt-2">
                    <td className="p-2 pt-4 font-bold">Laba / (Rugi) Bersih</td>
                    <td className="text-right p-2 pt-4 font-bold">{formatCurrency(reportData.netProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default LostProfitReportPage;