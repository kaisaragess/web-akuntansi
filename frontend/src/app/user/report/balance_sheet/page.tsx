"use client";

import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import { useRouter } from "next/navigation";
import React, {useState, useEffect, useCallback} from "react";
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller";

// --- INTERFACE (Menggunakan yang sudah ada, ditambah BalanceSheetData) ---
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
  jenis: string; // Misal: "Harta Lancar", "Harta Tetap", "Kewajiban Jangka Pendek", "Ekuitas"
  normal_balance: string;
}

interface AggregatedAccount {
  code_account: string;
  account_name: string; 
  total: number;
  isAccumulation?: boolean; // BARU: untuk menandai akun akumulasi penyusutan
}

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueAccounts: AggregatedAccount[];
  expenseAccounts: AggregatedAccount[];
}

interface BalanceSheetData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netProfitLoss: number;
  finalEquity: number;
  assetsAccounts: AggregatedAccount[];
  liabilitiesAccounts: AggregatedAccount[];
  equityAccounts: AggregatedAccount[];
  
  // BARU: Pengelompokan Aset
  currentAssets: AggregatedAccount[];
  totalCurrentAssets: number;
  fixedAssets: AggregatedAccount[];
  totalFixedAssets: number;
  
  // BARU: Pengelompokan Kewajiban
  currentLiabilities: AggregatedAccount[];
  totalCurrentLiabilities: number;

  isBalanced: boolean;
}

// --- KOMPONEN ---

const BalanceSheetReportPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [coa, setCoa] = useState<Coa[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); 
  const [reportData, setReportData] = useState<BalanceSheetData | null>(null);
  const router = useRouter();

  // --- Fungsi Helper ---
  const formatCurrency = (amount: number, showNegativeParentheses = false) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)); // Selalu format angka absolut

    if (amount < 0 && showNegativeParentheses) {
      return `(${formatted})`;
    } else if (amount < 0) {
      return `-${formatted}`;
    }
    return formatted;
  };
  
  // Fungsi Laba Rugi (Disalin dari komponen Laba Rugi)
  const calculateProfitLoss = (
    filteredJournals: Journal[], 
    coaNameMap: Map<string, string>
  ): ReportData => {
    const revenueMap = new Map<string, number>(); 
    const expenseMap = new Map<string, number>(); 

    for (const journal of filteredJournals) {
      for (const entry of journal.entries) {
        const code = entry.code_account;
        
        // Akun Pendapatan (Kode 4)
        if (code.startsWith('4')) {
          const creditAmount = parseFloat(entry.credit) || 0;
          const currentTotal = revenueMap.get(code) || 0;
          revenueMap.set(code, currentTotal + creditAmount);
        }
        
        // Akun Beban (Kode 5)
        if (code.startsWith('5')) {
          const debitAmount = parseFloat(entry.debit) || 0;
          const currentTotal = expenseMap.get(code) || 0;
          expenseMap.set(code, currentTotal + debitAmount);
        }
      }
    }

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
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      revenueAccounts,
      expenseAccounts
    };
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

      if (journalRes && Array.isArray(journalRes)) {
        setJournals(journalRes as unknown as Journal[]);
      } else {
        setJournals([]);
        throw new Error("Data jurnal yang diterima dari server tidak valid.");
      }

      if (coaRes && Array.isArray(coaRes)) {
        setCoa(coaRes as Coa[]);
      } else {
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
  
  // --- FUNGSI ALGORITMA NERACA ---
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
    
    const coaNameMap = new Map<string, string>();
    const coaNormalBalanceMap = new Map<string, string>();
    const coaJenisMap = new Map<string, string>(); // BARU: untuk jenis akun

    for (const account of coa) {
      coaNameMap.set(account.code_account, account.account);
      coaNormalBalanceMap.set(account.code_account, account.normal_balance);
      coaJenisMap.set(account.code_account, account.jenis); // Simpan jenis akun
    }
    
    // Neraca adalah laporan KUMULATIF, jadi kita ambil data Jurnal HINGGA akhir periode yang dipilih.
    const selectedDate = new Date(`${selectedPeriod}-01`); 
    const endDateOfPeriod = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0); // Akhir bulan yang dipilih

    const filteredJournalsCumulative = journals.filter(journal => {
      const journalDate = new Date(journal.date);
      return journalDate <= endDateOfPeriod; 
    });
    
    // Jurnal untuk perhitungan Laba Rugi (hanya untuk periode bulan yang dipilih)
    const [year, month] = selectedPeriod.split('-');
    const profitLossJournals = journals.filter(journal => {
      const parts = journal.date.split('-'); 
      const journalYear = parts[0];
      const journalMonth = parts[1];
      return journalYear === year && journalMonth === month;
    });

    // 1. Hitung Laba Rugi periode berjalan (untuk Ekuitas)
    const currentProfitLoss = calculateProfitLoss(profitLossJournals, coaNameMap);
    
    // 2. Agregasi Saldo Akun (Harta, Kewajiban, Ekuitas) secara KUMULATIF
    const assetMap = new Map<string, number>(); 
    const liabilityMap = new Map<string, number>(); 
    const equityMap = new Map<string, number>(); 

    for (const journal of filteredJournalsCumulative) {
      for (const entry of journal.entries) {
        const code = entry.code_account;
        const debit = parseFloat(entry.debit) || 0;
        const credit = parseFloat(entry.credit) || 0;
        
        const map = code.startsWith('1') ? assetMap : 
                    code.startsWith('2') ? liabilityMap :
                    code.startsWith('3') ? equityMap : null;

        if (map) {
          const normalBalance = coaNormalBalanceMap.get(code);
          let diff = 0;
          if (normalBalance === 'Debit') {
              diff = debit - credit;
          } else { // Normal Balance Kredit
              diff = credit - debit;
          }
          
          const currentTotal = map.get(code) || 0;
          map.set(code, currentTotal + diff);
        }
      }
    }

    // 3. Transformasi Map ke Array dan Hitung Total
    
    // ASET
    let totalAssets = 0;
    const assetsAccounts: AggregatedAccount[] = [];
    const currentAssets: AggregatedAccount[] = []; // BARU
    let totalCurrentAssets = 0; // BARU
    const fixedAssets: AggregatedAccount[] = []; // BARU
    let totalFixedAssets = 0; // BARU

    assetMap.forEach((total, code) => {
      const accountName = coaNameMap.get(code) || "Nama Akun Tidak Ditemukan";
      const accountJenis = coaJenisMap.get(code); // Ambil jenis akun
      
      // Saldo Akumulasi Penyusutan harus ditampilkan negatif
      const isAccumulation = accountName.toLowerCase().includes('akum. penyusutan');
      const finalTotal = total; // Biarkan saldo sesuai perhitungan, untuk Akumulasi akan negatif

      const aggregatedAccount: AggregatedAccount = {
        code_account: code,
        account_name: accountName,
        total: finalTotal,
        isAccumulation: isAccumulation
      };

      assetsAccounts.push(aggregatedAccount); // Untuk total keseluruhan

      if (accountJenis?.toLowerCase().includes('harta lancar')) { // Asumsi ada 'jenis' di COA
        currentAssets.push(aggregatedAccount);
        totalCurrentAssets += finalTotal;
      } else if (accountJenis?.toLowerCase().includes('harta tetap')) { // Asumsi ada 'jenis' di COA
        fixedAssets.push(aggregatedAccount);
        // Akumulasi penyusutan akan mengurangi total harta tetap
        if (!isAccumulation) {
            totalFixedAssets += finalTotal;
        } else {
            totalFixedAssets += finalTotal; // totalnya memang negatif, jadi akan mengurangi
        }
      }
      totalAssets += finalTotal; // Total Aset keseluruhan
    });

    // KEWAJIBAN
    let totalLiabilities = 0;
    const liabilitiesAccounts: AggregatedAccount[] = [];
    const currentLiabilities: AggregatedAccount[] = []; // BARU
    let totalCurrentLiabilities = 0; // BARU

    liabilityMap.forEach((total, code) => {
      const accountName = coaNameMap.get(code) || "Nama Akun Tidak Ditemukan";
      const accountJenis = coaJenisMap.get(code); // Ambil jenis akun
      
      const finalTotal = total; 
      const aggregatedAccount: AggregatedAccount = {
        code_account: code,
        account_name: accountName,
        total: finalTotal
      };
      liabilitiesAccounts.push(aggregatedAccount);

      if (accountJenis?.toLowerCase().includes('kewajiban jangka pendek') || 
          accountName.toLowerCase().includes('hutang usaha') ||
          accountName.toLowerCase().includes('hutang gaji') ||
          accountName.toLowerCase().includes('hutang listrik')) { // Asumsi ada 'jenis' atau bisa dari nama
        currentLiabilities.push(aggregatedAccount);
        totalCurrentLiabilities += finalTotal;
      }
      totalLiabilities += finalTotal;
    });

    // EKUITAS
    let totalEquityRaw = 0;
    const equityAccounts: AggregatedAccount[] = [];
    equityMap.forEach((total, code) => {
      const finalTotal = total; 
      equityAccounts.push({
        code_account: code,
        account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
        total: finalTotal
      });
      totalEquityRaw += finalTotal;
    });
    
    // Ekuitas Akhir = Saldo Akun Ekuitas (Modal/Prive) + Laba/Rugi Bersih
    const netProfitLoss = currentProfitLoss.netProfit;
    const finalEquity = totalEquityRaw + netProfitLoss;
    
    // Total Kewajiban + Ekuitas (sisi kanan Neraca)
    const totalLiabilitiesAndEquity = totalLiabilities + finalEquity;
    
    // Cek Keseimbangan
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1; 
    
    setReportData({
      totalAssets,
      totalLiabilities,
      totalEquity: totalLiabilitiesAndEquity,
      netProfitLoss,
      finalEquity,
      assetsAccounts,
      liabilitiesAccounts,
      equityAccounts,
      currentAssets, // BARU
      totalCurrentAssets, // BARU
      fixedAssets, // BARU
      totalFixedAssets, // BARU
      currentLiabilities, // BARU
      totalCurrentLiabilities, // BARU
      isBalanced
    });
  };

  // --- Print Function ---
  const handlePrint = () => {
    window.print();
  };

  // --- RENDER ---

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }
          .printable-report, .printable-report * {
            visibility: visible;
            height: auto;
            overflow: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            border: none;
            box-shadow: none;
            font-size: 12px; /* Lebih kecil untuk print */
          }
          .printable-report h2, .printable-report h3 {
              font-size: 1.2em; /* Ukuran heading yang lebih proporsional */
          }
          .printable-report button {
            display: none;
          }
          /* Penyesuaian untuk tampilan kolom di print */
          .printable-report .flex-col.md\\:flex-row {
              flex-direction: row !important;
          }
          .printable-report .flex-1 {
              flex: 1 1 50% !important;
          }
        }
      `}</style>

      <div className="flex min-h-screen pt-15">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu/>
        
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Laporan Neraca
          </h1>
            {reportData && (
              <button
                onClick={handlePrint}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Cetak PDF
              </button>
            )}
          </div>

          <form onSubmit={handleShowReport} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Pilih Periode Laporan</h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="periode">Periode (Akhir Bulan):</label>
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

          {/* Area untuk menampilkan Laporan Neraca */}
          {reportData && (
            <div 
              id="laporan-neraca"
              className="printable-report bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-bold mb-2 text-center">PT. HSEO GRHA TEKNO GROUP</h2>
              <h2 className="text-xl font-bold mb-2 text-center">Laporan Neraca</h2>
              <h3 className="text-lg mb-4 text-center">Per {selectedPeriod}</h3>

               <th
                    className={`mb-3 font-bold text-center rounded text-shadow-xs text-shadow-black ${
                      reportData.isBalanced
                        ? "bg-red-200 text-red-800" 
                        : "bg-teal-500 text-white"
                    }`}
                >
                    <td colSpan={4} className="px-4 py-2">
                      {reportData.isBalanced
                        ? `PERHATIAN: Neraca Saldo TIDAK Seimbang! 
                        Selisih: ${formatCurrency(
                            reportData.totalAssets - (reportData.totalLiabilities + reportData.finalEquity), false
                          )} `
                        : "Neraca Saldo Seimbang (BALANCE)"
                        }
                    </td>
                </th>
             
              <div className="flex flex-col md:flex-row gap-8">
                {/* Kolom Kiri: ASET */}
                <div className="flex-1">
                  <h4 className="text-lg mt-3 font-bold mb-2">AKTIVA</h4>
                  {/* Harta Lancar */}
                  <h5 className="font-bold pl-2">Asset Lancar</h5>
                  <table className="w-full mb-3 border-collapse">
                    <tbody>
                      {reportData.assetsAccounts.map((acc, index) => (
                        <tr key={`asset-${index}`} className="border-b border-gray-200">
                          <td className="p-1 pl-4 text-sm">{acc.account_name}</td>
                          <td className="p-1 text-right text-sm">{formatCurrency(Math.abs(acc.total))}</td>
                          <td className="p-1 text-right text-sm"></td> {/* Kolom kosong untuk total kelompok */}
                        </tr>
                      ))}
                      <tr className="border-b border-gray-300">
                          <td className="p-1 pl-2 font-bold text-sm">Total Asset Lancar</td>
                          <td className="p-1 text-right font-bold text-sm"></td>
                          <td className="p-1 text-right font-bold text-sm">{formatCurrency(Math.abs(reportData.totalAssets))}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Harta Tetap */}
                  <h5 className="font-bold pl-2">Asset Tidak Lancar</h5>
                  <table className="w-full mb-6 border-collapse">
                    <tbody>
                      {reportData.fixedAssets.map((acc, index) => (
                        <tr key={`fixed-asset-${index}`} className="border-b border-gray-100">
                          <td className="p-1 pl-4 text-sm">
                            {acc.isAccumulation ? `Akum. Penyusutan ${acc.account_name.replace('Akum. Penyusutan ', '')}` : acc.account_name}
                          </td>
                          <td className="p-1 text-right text-sm">
                            {/* Tampilkan Akumulasi Penyusutan dalam kurung atau sebagai negatif */}
                            {acc.isAccumulation ? formatCurrency(Math.abs(acc.total), true) : formatCurrency(Math.abs(acc.total))}
                          </td>
                          <td className="p-1 text-right text-sm"></td> {/* Kolom kosong untuk total buku */}
                        </tr>
                      ))}
                      <tr className="border-b border-gray-300">
                          <td className="p-1 pl-2 font-bold text-sm">Total Asset Tidak Lancar</td>
                          <td className="p-1 text-right font-bold text-sm"></td>
                          <td className="p-1 text-right font-bold text-sm">{formatCurrency(Math.abs(reportData.totalFixedAssets))}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* TOTAL AKTIVA */}
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-t-2 border-b-4 border-black bg-gray-100">
                        <td className="p-2 font-bold">TOTAL AKTIVA</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(Math.abs(reportData.totalAssets))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Kolom Kanan: Kewajiban & Ekuitas */}
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2">PASSIVA</h4>
                  {/* Hutang Lancar */}
                  <h5 className="font-bold pl-2">Hutang Lancar</h5>
                  <table className="w-full mb-3 border-collapse">
                    <tbody>
                      {reportData.liabilitiesAccounts.map((acc, index) => (
                        <tr key={`curr-liab-${index}`} className="border-b border-gray-100">
                          <td className="p-1 pl-4 text-sm">{acc.account_name}</td>
                          <td className="p-1 text-right text-sm">{formatCurrency(acc.total)}</td>
                          <td className="p-1 text-right text-sm"></td> {/* Kolom kosong untuk total kelompok */}
                        </tr>
                      ))}
                      
                        <tr className="border-b border-gray-300">
                          <td className="p-1 pl-2 font-bold text-sm">Total Hutang Lancar</td>
                          <td className="p-1 text-right font-bold text-sm"></td>
                          <td className="p-1 text-right font-bold text-sm">{formatCurrency(reportData.totalLiabilities)}</td>
                      </tr>
                      
                    </tbody>
                  </table>

                  {/* Modal Pemilik */}
                  <h5 className="font-bold pl-2">Modal Pemilik</h5>
                  <table className="w-full mb-6 border-collapse">
                    <tbody>
                      {reportData.equityAccounts.map((acc, index) => (
                        <tr key={`equity-${index}`} className="border-b border-gray-100">
                          <td className="p-1 pl-4 text-sm">{acc.account_name}</td>
                          <td className="p-1 text-right text-sm">{formatCurrency(acc.total)}</td>
                          <td className="p-1 text-right text-sm"></td>
                        </tr>
                      ))}
                      {/* Laba Bersih */}
                      <tr className="border-b border-gray-100">
                        <td className="p-1 pl-4 font-bold text-sm text-green-700">Laba (Rugi) Tahun Berjalan</td>
                        <td className="p-1 text-right font-bold text-sm text-green-700">{formatCurrency(reportData.netProfitLoss)}</td>
                        <td className="p-1 text-right font-bold text-sm"></td>
                      </tr>

                      <tr className="border-b border-gray-300">
                        <td className="p-1 pl-2 font-bold text-sm">Total Modal</td> {/* Asumsi hanya ada satu akun modal */}
                        <td className="p-1 text-right font-bold text-sm"></td>
                        <td className="p-1 text-right font-bold text-sm">{formatCurrency(reportData.finalEquity)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Total Passiva */}
                  <table className="w-full border-collapse">
                    <tbody>
                        <tr className="border-t-2 border-b-4 border-black bg-gray-100">
                          <td className="p-2 font-bold">TOTAL PASSIVA</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(reportData.totalLiabilities + reportData.finalEquity)}</td>
                        </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </>
  );
}

export default BalanceSheetReportPage;