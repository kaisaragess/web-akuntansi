"use client";

import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import AuthGuard from "@/app/components/AuthGuard/page";
import { useRouter } from "next/navigation";
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
  date: string; // Asumsi ini adalah ISO String: "2024-10-25T10:00:00.000Z"
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
  jenis: string; // Kita akan asumsikan 'Prive' ada di sini
  normal_balance: string;
}

// --- DIUBAH: Interface khusus untuk laporan ini ---
interface EquityReportData {
  modalAwal: number;
  labaBersih: number;
  totalPrive: number;
  modalAkhir: number;
  // Kita simpan nama akun modal & prive
  modalAccountName: string;
  priveAccountName: string;
}

// --- KOMPONEN ---

const EquityChangePage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [coa, setCoa] = useState<Coa[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); 
  
  // --- DIUBAH: Menggunakan interface reportData yang baru ---
  const [reportData, setReportData] = useState<EquityReportData | null>(null);

  const router = useRouter();

  // --- Fungsi Helper ---
  const formatCurrency = (amount: number, showParentheses = false) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)); // Ambil nilai absolut

    if (showParentheses && amount > 0) {
      // Untuk Prive, kita ingin format (8.000.000)
      return `(${formatted})`;
    }
    if (amount < 0) {
      // Untuk Rugi Bersih
      return `(${formatted})`;
    }
    return formatted;
  };

//   // --- Fetch Data ---
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
          // --- DIUBAH: Validasi yang lebih aman ---
          setJournals(journalRes as unknown as Journal[]);
          // --- BARU: Log format tanggal pertama ---
          if (journalRes.length > 0) {
            // console.log("DEBUG: Format tanggal jurnal pertama dari API:", journalRes[0].date);
          }
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


  // --- FUNGSI ALGORITMA PERUBAHAN MODAL ---
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
    
    try {
      const [year, month] = selectedPeriod.split('-');
      const periodStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const periodEndDate = new Date(parseInt(year), parseInt(month), 0);

      const coaNameMap = new Map<string, string>();
      const priveAccountCodes = new Set<string>();
      let modalAccountName = "Modal Pemilik"; 
      let priveAccountName = "Prive"; 

      for (const account of coa) {
        coaNameMap.set(account.code_account, account.account);
        if (account.account.toLowerCase().includes('prive')) { 
          priveAccountCodes.add(account.code_account);
          priveAccountName = account.account; // misal: "Prive Bu Anita"
        }
        if (account.account.toLowerCase().includes('modal') && !priveAccountCodes.has(account.code_account)) {
          modalAccountName = account.account; // misal: "Modal Bu Anita"
        }
      }

      const journalsBeforePeriod: Journal[] = [];
      const journalsForPeriod: Journal[] = [];

      for (const journal of journals) {
        // --- PERBAIKAN: Logika parsing tanggal ---
        const journalDate = new Date(journal.date);

        // Validasi jika tanggalnya tidak valid
        if (isNaN(journalDate.getTime())) {
          continue; 
        }

        if (journalDate < periodStartDate) {
          journalsBeforePeriod.push(journal);
        } else if (journalDate >= periodStartDate && journalDate <= periodEndDate) {
          journalsForPeriod.push(journal);
        }
      }

      let modalAwal = 0;
      for (const journal of journalsBeforePeriod) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          const credit = parseFloat(entry.credit) || 0;
          const debit = parseFloat(entry.debit) || 0;

          if (code.startsWith('3')) { 
            modalAwal += (credit - debit);
          } else if (code.startsWith('4')) { 
            modalAwal += (credit - debit);
          } else if (code.startsWith('5')) { 
            modalAwal -= (debit - credit);
          }
        }
      }

      let labaBersih = 0;
      let totalPrive = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      for (const journal of journalsForPeriod) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          const credit = parseFloat(entry.credit) || 0;
          const debit = parseFloat(entry.debit) || 0;

          if (priveAccountCodes.has(code)) {
            totalPrive += (debit - credit);
          } else if (code.startsWith('4')) { 
            totalRevenue += (credit - debit);
          } else if (code.startsWith('5')) { 
            totalExpenses += (debit - credit);
          }
        }
      }

      labaBersih = totalRevenue - totalExpenses;

      const modalAkhir = modalAwal + labaBersih - totalPrive;

      const finalReportData = {
        modalAwal,
        labaBersih,
        totalPrive,
        modalAkhir,
        modalAccountName,
        priveAccountName
      };
      setReportData(finalReportData);

    } catch (err) {
      console.error("DEBUG: Gagal menghitung laporan:", err); // --- BARU ---
      setError(err instanceof Error ? err.message : "Terjadi error saat kalkulasi.");
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
        
        {/* --- DIUBAH: Hapus class 'printable-report' dari <main> --- */}
        <main className={`flex-1 p-6 bg-gray-100`}>
          <div className="flex justify-between items-center mb-6 no-print"> {/* Sembunyikan header saat print */}
            <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Laporan Perubahan Modal
          </h1>
        </div>
            {reportData && (
              <button
                onClick={handlePrint}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors print-button no-print" // Class untuk print
              >
                Cetak PDF
              </button>
            )}
          </div>


          <form onSubmit={handleShowReport} className="bg-white p-6 rounded-lg shadow-md mb-6 report-form no-print"> {/* Class & Sembunyikan form saat print */}
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

          {/* --- Area Laporan Perubahan Modal --- */}
          {/* --- DIUBAH: Tambahkan class 'printable-report' HANYA di sini --- */}
          {reportData && (
            <div 
              id="laporan-perubahan-modal"
              className="printable-report bg-white p-6 sm:p-10 rounded-lg shadow-md max-w-3xl mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">HSEO GROUP</h2>
                <h2 className="text-xl font-bold mb-1">Laporan Perubahan Modal</h2>
                <h3 className="text-lg">Untuk Periode yang Berakhir pada {selectedPeriod}</h3>
              </div>

              {/* Tabel laporan */}
              <table className="w-full text-base">
                <tbody>
                  {/* Modal Awal */}
                  <tr className="font-bold">
                    <td className="p-2 w-3/5">{reportData.modalAccountName} (Awal)</td>
                    <td className="p-2 w-2/5 text-right">{formatCurrency(reportData.modalAwal)}</td>
                  </tr>
                  
                  {/* Laba/Rugi Bersih */}
                  <tr>
                    <td className="p-2 pl-6">{reportData.labaBersih >= 0 ? "Laba Bersih" : "Rugi Bersih"}</td>
                    <td className="p-2 text-right border-b border-gray-400">{formatCurrency(reportData.labaBersih)}</td>
                  </tr>

                  {/* Subtotal (Modal Awal + Laba/Rugi) */}
                  <tr className="font-medium">
                    <td className="p-2"></td>
                    <td className="p-2 text-right">{formatCurrency(reportData.modalAwal + reportData.labaBersih)}</td>
                  </tr>

                  {/* Prive */}
                  <tr className="pt-2">
                    <td className="p-2 pl-6">{reportData.priveAccountName}</td>
                    <td className="p-2 text-right border-b border-gray-400">{formatCurrency(reportData.totalPrive, true)}</td>
                  </tr>

                  {/* Modal Akhir */}
                  <tr className="font-bold text-lg">
                    <td className="p-2 pt-4">{reportData.modalAccountName} (Akhir)</td>
                    <td className="p-2 pt-4 text-right border-t-2 border-b-2 border-black">{formatCurrency(reportData.modalAkhir)}</td>
                  </tr>

                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      </div>
    </>
    </AuthGuard>
  );
};


export default EquityChangePage;

