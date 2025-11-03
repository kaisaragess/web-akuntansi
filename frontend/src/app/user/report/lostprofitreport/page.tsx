"use client"; // ⚙ Menandakan bahwa komponen ini berjalan di sisi client (Client Component) di Next.js

// --- IMPORT KOMPONEN DAN DEPENDENSI ---
import Navbar from "@/app/components/Navbar/page"; // Komponen Navbar
import Sidebar from "@/app/components/Sidebar/page"; // Komponen Sidebar
import { useRouter } from "next/navigation"; // Hook untuk navigasi antar halaman
import React, { useState, useEffect, useCallback, useRef } from "react"; // React Hooks
import Image from "next/image"; // Import Image dari next/image
import { AxiosCaller } from "../../../../../axios-client/axios-caller/AxiosCaller"; // Kelas untuk memanggil API menggunakan Axios

// --- INTERFACE UNTUK TIPE DATA ---
// Struktur data untuk entri jurnal
interface Entry {
  id_coa: number;
  code_account: string;
  debit: string;
  credit: string;
}

// Struktur data jurnal lengkap
interface Journal {
  id: number;
  date: string; // Format tanggal (ISO)
  description: string;
  referensi: string;
  lampiran: string;
  nomor_bukti: string;
  entries: Entry[];
}

// Struktur data Chart of Accounts (COA)
interface Coa {
  id: number;
  code_account: string;
  account: string;
  jenis: string;
  normal_balance: string;
}

// Struktur data hasil agregasi akun
interface AggregatedAccount {
  code_account: string;
  account_name: string;
  total: number;
}

// Struktur data laporan laba rugi
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk dropdown export

  const router = useRouter();

  // --- Fungsi Helper ---
  const formatCurrency = (amount: number): string => {
    // Memastikan angka yang diformat adalah absolute untuk tampilan dalam kurung
    const value = Math.abs(amount); 
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  // Fungsi helper untuk nama bulan dalam Bahasa Indonesia
  const getMonthName = (monthYear: string): string => {
    try {
        const [year, month] = monthYear.split('-');
        if (!month || !year) return monthYear;
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    } catch (e) {
        return monthYear;
    }
  }


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

  // --- FUNGSI ALGORITMA LABA RUGI (TIDAK BERUBAH) ---
  const handleShowReport = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReportData(null);

    if (!selectedPeriod) {
      alert("Silakan pilih periode terlebih dahulu.");
      return;
    }
    if (journals.length === 0 || coa.length === 0) {
      alert("Data jurnal atau Coa belum siap.");
      return;
    }

    try {
      const coaNameMap = new Map<string, string>();
      for (const account of coa) {
        coaNameMap.set(account.code_account, account.account);
      }
      
      const [year, month] = selectedPeriod.split('-');

      const filteredJournals = journals.filter(journal => {
        const journalDate = new Date(journal.date);
        if (isNaN(journalDate.getTime())) return false;
        const journalYear = journalDate.getFullYear().toString();
        const journalMonth = (journalDate.getMonth() + 1).toString().padStart(2, '0');
        return journalYear === year && journalMonth === month;
      });

      const revenueMap = new Map<string, number>();
      const expenseMap = new Map<string, number>();

      for (const journal of filteredJournals) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          
          // Logika Pendapatan (Awalan 4)
          if (code.startsWith('4')) {
            const creditAmount = parseFloat(entry.credit) || 0;
            const debitAmount = parseFloat(entry.debit) || 0;
            const currentTotal = revenueMap.get(code) || 0;
            revenueMap.set(code, currentTotal + (creditAmount - debitAmount));
          }
          
          // Logika Biaya/Beban (Awalan 5)
          if (code.startsWith('5')) {
            const debitAmount = parseFloat(entry.debit) || 0;
            const creditAmount = parseFloat(entry.credit) || 0;
            const currentTotal = expenseMap.get(code) || 0;
            expenseMap.set(code, currentTotal + (debitAmount - creditAmount));
          }
        }
      }

      let totalRevenue = 0;
      const revenueAccounts: AggregatedAccount[] = [];
      revenueMap.forEach((total, code) => {
        if (Math.abs(total) >= 0.01) { // Hanya tampilkan akun dengan saldo signifikan
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
          if (Math.abs(total) >= 0.01) { // Hanya tampilkan akun dengan saldo signifikan
             expenseAccounts.push({
               code_account: code,
               account_name: coaNameMap.get(code) || "Nama Akun Tidak Ditemukan",
               total
             });
             totalExpenses += total;
          }
      });
      
      // Urutkan akun untuk tampilan yang lebih rapi
      revenueAccounts.sort((a, b) => a.code_account.localeCompare(b.code_account));
      expenseAccounts.sort((a, b) => a.code_account.localeCompare(b.code_account));

      const netProfit = totalRevenue - totalExpenses;

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


  // --- FUNGSI EXPORT ---

  // Fungsi untuk mengambil konten HTML yang akan diekspor
  const getReportContent = (): string | null => {
    const reportElement = document.getElementById("laporan-laba-rugi");
    if (!reportElement) return null;

    // Buat salinan konten untuk modifikasi sebelum ekspor
    const contentClone = reportElement.cloneNode(true) as HTMLElement;

    // Hapus class 'max-w-3xl mx-auto' yang mungkin mengganggu layout print/export
    contentClone.className = 'printable-report';

    // Perlu format mata uang agar terlihat benar di file yang diekspor
    // Karena formatCurrency menggunakan format IDR, kita ubah agar terlihat rapi tanpa simbol
    const formattedContent = contentClone.innerHTML.replace(
      /Rp\s(\d{1,3}(\.\d{3})*)/g, 
      (match, p1) => p1.replace(/\./g, '') // Hapus titik ribuan untuk export non-PDF yang lebih bersih
    );

    return formattedContent;
  };
  
  // Modifikasi gaya untuk ekspor
  const commonStyle = `
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
      th, td { padding: 8px 10px; font-size: 11pt; }
      .header-table th, .header-table td { border: none; padding: 0; }
      .section-title { font-weight: bold; padding-top: 15px; }
      .total-row { border-top: 1px solid #000; font-weight: bold; }
      .grand-total-row { border-top: 2px solid #000; font-weight: bold; }
      .negative { color: red; }
  `;

  const handleExportPDF = () => {
    const content = getReportContent();
    if (!content) {
      alert("Laporan belum tersedia atau kosong.");
      return;
    }
    
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Laporan Laba Rugi - ${selectedPeriod}</title>
          <style>
            ${commonStyle}
            /* Style khusus PDF */
            .printable-report { max-width: 700px; margin: 0 auto; }
            td { vertical-align: top; }
            .currency-cell { text-align: right; white-space: nowrap; }
            .title-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="printable-report">
             <div class="title-center mb-6">
                <h2 style="font-size: 16pt; margin-bottom: 5px;">HSEO GROUP</h2>
              </div>
            ${content}
          </div>
        </body>
      </html>
    `);
    newWindow?.document.close();
    // Gunakan timeout singkat untuk memastikan konten dimuat sebelum print
    setTimeout(() => {
        newWindow?.print();
    }, 500);
  };
  
  const handleExportDoc = () => {
    const content = getReportContent();
    if (!content) {
      alert("Laporan belum tersedia atau kosong.");
      return;
    }
    
    // Konversi HTML laporan ke format yang lebih ramah DOC
    const docContent = `
        <table>
          <tr><td colspan="2" style="text-align:center; font-size:16pt; font-weight:bold;">HSEO GROUP</td></tr>
          <tr><td colspan="2" style="text-align:center; font-size:14pt; font-weight:bold;">Laporan Laba Rugi</td></tr>
          <tr><td colspan="2" style="text-align:center; font-size:12pt; margin-bottom: 20px;">Untuk Periode yang Berakhir pada ${getMonthName(selectedPeriod)}</td></tr>
        </table>
        ${content}
    `;

    const html = `<html><head><meta charset="utf-8"></head><body>${docContent}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Laba_Rugi_${selectedPeriod}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const content = getReportContent();
    if (!content) {
      alert("Laporan belum tersedia atau kosong.");
      return;
    }

    // Tambahkan header Excel
    const header = `
        <table class="header-table">
          <tr><td colspan="2" style="text-align:center; font-weight:bold;">HSEO GROUP</td></tr>
          <tr><td colspan="2" style="text-align:center; font-weight:bold;">Laporan Laba Rugi</td></tr>
          <tr><td colspan="2" style="text-align:center;">Untuk Periode yang Berakhir pada ${getMonthName(selectedPeriod)}</td></tr>
        </table>
    `;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 5px; }
            .header-table td { border: 1px solid #000; }
            .currency-cell { mso-number-format:"\#\,\#\#0"; text-align: right; } /* Format angka Excel */
            .total-row { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          ${header}
          ${content}
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Laba_Rugi_${selectedPeriod}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // --- RENDER ---
  return (
    <>
      {/* --- CSS Print (Disempurnakan untuk tampilan L/R) --- */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-report {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 700px; /* Batasi lebar untuk layout A4 */
            margin: 0 auto;
            padding: 10mm 20mm;
            border: 1px solid #000000;
            box-shadow: none;
            font-size: 11pt;
            color: black;
            background-color: white !important;
          }
          .printable-report * {
            visibility: visible !important;
            color: black !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border-color: #ccc !important;
          }
          table {
          border-color: #000 !important;
              page-break-inside: auto;
              width: 100%; /* Pastikan tabel penuh */
          }
          tr {
              page-break-inside: avoid;
              page-break-after: auto;
              border-top-width: 2px !important;
              border-top-color: #000 !important;
          }
          td, th {
              border-color: #000 !important; /* Border hitam saat print */
              padding: 5px;
          }
          .border-t-2 {
              border-top-width: 2px !important;
              border-top-color: #000 !important;
          }
          .border-t {
              border-top-width: 1px !important;
              border-top-color: #000 !important;
          }
        }
      `}</style>
      {/* --- AKHIR CSS --- */}

      <div className="flex min-h-screen pt-15">
        <Sidebar />
        <div className="flex-1 p-6">
          <Navbar hideMenu/>
          
          <main className={`flex-1 p-6 bg-gray-100`}>
            {/* --- Header dan Tombol Export --- */}
            <div className="flex justify-between items-center mb-6 no-print"> 
              <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
                  Laporan Laba Rugi
              </h1>
              
              {/* Dropdown Export */}
              {reportData && (
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-black px-3 py-1 rounded hover:bg-green-200 text-sm border border-gray-300"
                    >
                        <Image src="/printer.png" alt="Print Icon" width={28} height={28} />
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
                <div className="text-center mb-6 no-print-center"> {/* Gunakan no-print-center untuk memastikan rata kiri/kanan di print */}
                  {/* <h2 className="text-xl font-bold mb-1">HSEO GROUP</h2> Ganti Nama Perusahaan */}
                  <h2 className="text-2xl font-bold mb-1">Laporan Laba Rugi</h2>
                  <h3 className="text-lg">Untuk Periode yang Berakhir pada {getMonthName(selectedPeriod)}</h3>
                </div>

                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left font-bold p-2">Keterangan</th>
                      <th className="text-right font-bold p-2">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pendapatan */}
                    <tr>
                      <td className="p-2 pt-4 font-bold section-title" colSpan={2}>Pendapatan Usaha:</td>
                    </tr>
                    {reportData.revenueAccounts.length > 0 ? (
                      reportData.revenueAccounts.map((acc, index) => (
                        <tr key={`rev-${index}`}>
                          <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                          <td className="text-right p-2 currency-cell">{formatCurrency(acc.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-2 pl-6 text-gray-500 italic" colSpan={2}>Tidak ada pendapatan</td></tr>
                    )}
                    <tr className="border-t border-gray-300 total-row">
                      <td className="p-2 font-bold">Total Pendapatan</td>
                      <td className="text-right p-2 font-bold currency-cell">{formatCurrency(reportData.totalRevenue)}</td>
                    </tr>

                    {/* Beban */}
                    <tr>
                      <td className="p-2 pt-4 font-bold section-title" colSpan={2}>Beban Operasi:</td>
                    </tr>
                      {reportData.expenseAccounts.length > 0 ? (
                      reportData.expenseAccounts.map((acc, index) => (
                        <tr key={`exp-${index}`}>
                          <td className="p-2 pl-6">{acc.code_account} - {acc.account_name}</td>
                          <td className="text-right p-2 currency-cell">{formatCurrency(acc.total)}</td>
                        </tr>
                      ))
                      ) : (
                        <tr><td className="p-2 pl-6 text-gray-500 italic" colSpan={2}>Tidak ada beban</td></tr>
                      )}
                    <tr className="border-t border-gray-300 total-row">
                      <td className="p-2 font-bold">Total Beban</td>
                      <td className="text-right p-2 font-bold currency-cell">
                          {reportData.totalExpenses === 0 
                            ? formatCurrency(0) 
                            : `(${formatCurrency(reportData.totalExpenses)})`
                          }
                      </td>
                    </tr>

                    {/* Laba Bersih */}
                    <tr className="border-t-2 border-gray-400 mt-2 grand-total-row">
                      <td className="p-2 pt-4 font-bold">{reportData.netProfit >= 0 ? "Laba Bersih" : "Rugi Bersih"}</td>
                      <td className={`p-2 pt-4 font-bold text-right currency-cell ${reportData.netProfit < 0 ? 'text-red-600 negative' : ''}`}>
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
  );
};

export default LostProfitReportPage;
