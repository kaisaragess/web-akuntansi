"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { useRouter } from "next/navigation";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller"; // Sesuaikan path ini
import { Banknote, FileText, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react"; // Impor ikon

// --- INTERFACE (Sama seperti di Laporan) ---
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
  jenis: string; // Penting untuk identifikasi Kas, Piutang, Hutang
  normal_balance: string;
}

// --- Interface untuk Data Dashboard ---
interface DashboardData {
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  netProfitThisMonth: number;
}

const Dashboard = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [coa, setCoa] = useState<Coa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const router = useRouter();

  // --- Fungsi Helper ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- Fetch Data Awal ---
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
      const axiosCaller = new AxiosCaller("http://localhost:3001"); // Sesuaikan URL

      const [journalRes, coaRes] = await Promise.all([
        axiosCaller.call["GET /journals"]({
          headers: { authorization: token },
          query: { limit: 9999 }, // Ambil semua jurnal
        }),
        axiosCaller.call["GET /coa"]({
          headers: { authorization: token },
          query: { limit: 9999 }, // Ambil semua Coa
        }),
      ]);

      // Validasi Jurnal
      if (journalRes && Array.isArray(journalRes)) {
        setJournals(journalRes as unknown as Journal[]);
      } else {
        throw new Error("Data jurnal tidak valid.");
      }

      // Validasi Coa
      if (coaRes && Array.isArray(coaRes)) {
        setCoa(coaRes as Coa[]);
      } else {
        throw new Error("Data Coa tidak valid.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data awal."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // --- Panggil Fetch Data saat Komponen Dimuat ---
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Fungsi Kalkulasi Data Dashboard ---
  const calculateDashboardData = useCallback(() => {
    if (journals.length === 0 || coa.length === 0) {
      return; // Belum siap
    }

    // Identifikasi kode akun yang relevan
    const cashAccountCodes = new Set<string>();
    const arAccountCodes = new Set<string>(); // Accounts Receivable (Piutang)
    const apAccountCodes = new Set<string>(); // Accounts Payable (Hutang)

    for (const account of coa) {
      // Asumsi 'jenis' untuk Kas/Bank adalah 'Kas & Bank'
      if (account.account.startsWith('Kas') || account.account.startsWith('Bank')) {
        cashAccountCodes.add(account.code_account);
      }
      // Asumsi 'jenis' untuk Piutang adalah 'Piutang Usaha'
      if (account.account.startsWith('Piutang')) {
        arAccountCodes.add(account.code_account);
      }
      // Asumsi 'jenis' untuk Hutang adalah 'Hutang Usaha'
      if (account.account.startsWith('Utang')) {
        apAccountCodes.add(account.code_account);
      }
    }

    let cashBalance = 0;
    let accountsReceivable = 0;
    let accountsPayable = 0;
    let totalRevenueThisMonth = 0;
    let totalExpensesThisMonth = 0;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = Januari, 11 = Desember

    for (const journal of journals) {
      const journalDate = new Date(journal.date); // Parse ISO date
      if (isNaN(journalDate.getTime())) continue; // Skip invalid dates

      const isThisMonth = journalDate.getFullYear() === currentYear && journalDate.getMonth() === currentMonth;

      for (const entry of journal.entries) {
        const code = entry.code_account;
        const debit = parseFloat(entry.debit) || 0;
        const credit = parseFloat(entry.credit) || 0;

        // Hitung Saldo Kas (Normal Debit)
        if (cashAccountCodes.has(code)) {
          cashBalance += (debit - credit);
        }
        // Hitung Saldo Piutang (Normal Debit)
        if (arAccountCodes.has(code)) {
          accountsReceivable += (debit - credit);
        }
        // Hitung Saldo Hutang (Normal Kredit)
        if (apAccountCodes.has(code)) {
          accountsPayable += (credit - debit); // Dibalik karena normal kredit
        }

        // Hitung Laba/Rugi Bulan Ini
        if (isThisMonth) {
          if (code.startsWith('4')) { // Pendapatan
            totalRevenueThisMonth += (credit - debit);
          } else if (code.startsWith('5')) { // Beban
            totalExpensesThisMonth += (debit - credit);
          }
        }
      }
    }

    const netProfitThisMonth = totalRevenueThisMonth - totalExpensesThisMonth;

    setDashboardData({
      cashBalance,
      accountsReceivable,
      accountsPayable,
      netProfitThisMonth,
    });
  }, [journals, coa]);

  // --- Panggil Kalkulasi saat Data Siap ---
  useEffect(() => {
    calculateDashboardData();
  }, [calculateDashboardData]); // Bergantung pada fungsi kalkulasi

  // --- RENDER ---
  return (
    <div className="flex min-h-screen pt-14 bg-gray-100 text-black"> {/* Background diubah */}
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu/>

      {/* Konten utama */}
      <main className="flex-1 p-6"> {/* Hapus container mx-auto & style spesifik */}
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Ringkasan Keuangan
          </h1>
        </div>

        {/* Tampilkan loading atau error */}
        {loading && <p className="text-center text-gray-600">Memuat data...</p>}
        {error && <p className="text-center text-red-600">Error: {error}</p>}

        {/* Tampilkan kartu data jika sudah siap */}
        {!loading && !error && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Layout responsif */}
            
            {/* Kartu Saldo Kas */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Kas & Setara Kas</p>
                <p className="text-xl font-semibold text-gray-800">
                  {formatCurrency(dashboardData.cashBalance)}
                </p>
              </div>
            </div>

            {/* Kartu Piutang Usaha */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Piutang Usaha</p>
                <p className="text-xl font-semibold text-gray-800">
                  {formatCurrency(dashboardData.accountsReceivable)}
                </p>
              </div>
            </div>

            {/* Kartu Hutang Usaha */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Landmark className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Hutang Usaha</p>
                <p className="text-xl font-semibold text-gray-800">
                  {formatCurrency(dashboardData.accountsPayable)}
                </p>
              </div>
            </div>

            {/* Kartu Laba/Rugi Bulan Ini */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md flex items-center space-x-4">
               <div className={`p-3 rounded-full ${dashboardData.netProfitThisMonth >= 0 ? 'bg-green-100' : 'bg-pink-100'}`}>
                 {dashboardData.netProfitThisMonth >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                 ) : (
                    <TrendingDown className="w-6 h-6 text-pink-600" />
                 )}
               </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Laba/(Rugi) Bulan Ini</p>
                <p className={`text-xl font-semibold ${dashboardData.netProfitThisMonth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(dashboardData.netProfitThisMonth)}
                </p>
              </div>
            </div>

          </div>
        )}

         {/* Anda bisa menambahkan bagian lain seperti grafik atau tabel di sini */}

      </main>
    </div>
    </div>  
  );
};

export default Dashboard;
