"use client";

import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

interface EquityReportData {
  modalAwal: number;
  labaBersih: number;
  totalPrive: number;
  modalAkhir: number;
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
  const [reportData, setReportData] = useState<EquityReportData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();

  // Format Rupiah
  const formatCurrency = (amount: number, showParentheses = false): string => {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));

    if (showParentheses && amount > 0) return `(${formatted})`;
    if (amount < 0) return `(${formatted})`;
    return formatted;
  };

  // Format bulan Indonesia
  const getMonthName = (monthYear: string): string => {
    try {
      const [year, month] = monthYear.split("-");
      if (!month || !year) return monthYear;
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
    } catch {
      return monthYear;
    }
  };

  // --- FETCH DATA ---
  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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
          query: { limit: 9999 },
        }),
        axiosCaller.call["GET /coa"]({
          headers: { authorization: token },
          query: { limit: 9999 },
        }),
      ]);

      // --- FIX: Konversi number -> string agar sesuai interface lokal ---
      if (Array.isArray(journalRes)) {
        const formattedJournals: Journal[] = journalRes.map((journal: any) => ({
          ...journal,
          entries: journal.entries.map((entry: any) => ({
            ...entry,
            debit: entry.debit.toString(),
            credit: entry.credit.toString(),
          })),
        }));
        setJournals(formattedJournals);
      } else {
        throw new Error("Data jurnal tidak valid.");
      }

      if (Array.isArray(coaRes)) setCoa(coaRes as Coa[]);
      else throw new Error("Data COA tidak valid.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- ALGORITMA LAPORAN PERUBAHAN MODAL ---
  const handleShowReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriod) return alert("Silakan pilih periode.");
    if (journals.length === 0 || coa.length === 0)
      return alert("Data jurnal atau COA belum siap.");

    try {
      const [year, month] = selectedPeriod.split("-");
      const periodStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const periodEndDate = new Date(parseInt(year), parseInt(month), 0);

      const priveAccountCodes = new Set<string>();
      let modalAccountName = "Modal Pemilik";
      let priveAccountName = "Prive";

      for (const account of coa) {
        if (account.account.toLowerCase().includes("prive")) {
          priveAccountCodes.add(account.code_account);
          priveAccountName = account.account;
        }
        if (account.account.toLowerCase().includes("modal") && !priveAccountCodes.has(account.code_account)) {
          modalAccountName = account.account;
        }
      }

      const journalsBeforePeriod: Journal[] = [];
      const journalsForPeriod: Journal[] = [];

      for (const journal of journals) {
        const journalDate = new Date(journal.date);
        if (isNaN(journalDate.getTime())) continue;
        if (journalDate < periodStartDate) journalsBeforePeriod.push(journal);
        else if (journalDate <= periodEndDate) journalsForPeriod.push(journal);
      }

      let modalAwal = 0;
      for (const journal of journalsBeforePeriod) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          const debit = parseFloat(entry.debit) || 0;
          const credit = parseFloat(entry.credit) || 0;
          if (code.startsWith("3")) modalAwal += credit - debit;
          else if (code.startsWith("4")) modalAwal += credit - debit;
          else if (code.startsWith("5")) modalAwal -= debit - credit;
        }
      }

      let labaBersih = 0;
      let totalPrive = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      for (const journal of journalsForPeriod) {
        for (const entry of journal.entries) {
          const code = entry.code_account;
          const debit = parseFloat(entry.debit) || 0;
          const credit = parseFloat(entry.credit) || 0;
          if (priveAccountCodes.has(code)) totalPrive += debit - credit;
          else if (code.startsWith("4")) totalRevenue += credit - debit;
          else if (code.startsWith("5")) totalExpenses += debit - credit;
        }
      }

      labaBersih = totalRevenue - totalExpenses;
      const modalAkhir = modalAwal + labaBersih - totalPrive;

      setReportData({
        modalAwal,
        labaBersih,
        totalPrive,
        modalAkhir,
        modalAccountName,
        priveAccountName,
      });
    } catch {
      setError("Gagal menghitung laporan.");
    }
  };

  // --- EXPORT ---
  const getReportContent = (): string | null => {
    const report = document.getElementById("laporan-perubahan-modal");
    if (!report) return null;
    const clone = report.cloneNode(true) as HTMLElement;
    clone.className = "printable-report";
    return clone.innerHTML;
  };

  const commonStyle = `
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
    th, td { padding: 8px 10px; font-size: 11pt; }
    th { background-color: #f2f2f2; }
    td { border-bottom: 1px solid #ddd; word-wrap: break-word; }
    .printable-report { width: 100%; max-width: 800px; margin: auto; }
    .section-title { font-size: 16pt; font-weight: bold; margin-top: 20px; }
    .total-row { border-top: 1px solid #000; font-weight: bold; }
    .grand-total-row { border-top: 2px solid #000; font-weight: bold; }
  `;

  const handleExportPDF = () => {
    const content = getReportContent();
    if (!content) return alert("Laporan belum tersedia.");
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Laporan Perubahan Modal - ${selectedPeriod}</title>
          <style>${commonStyle}
          .title-center { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="title-center">
            <h2>HSEO GROUP</h2>
            <h2>Laporan Perubahan Modal</h2>
            <h3>Untuk Periode yang Berakhir pada ${getMonthName(selectedPeriod)}</h3>
          </div>
          ${content}
        </body>
      </html>
    `);
    newWindow?.document.close();
    setTimeout(() => newWindow?.print(), 500);
  };

  const handleExportDoc = () => {
    const content = getReportContent();
    if (!content) return alert("Laporan belum tersedia.");
    const html = `
      <html><head><meta charset="utf-8"></head>
      <body>
        <h2 style="text-align:center">HSEO GROUP</h2>
        <h2 style="text-align:center">Laporan Perubahan Modal</h2>
        <h3 style="text-align:center">Untuk Periode yang Berakhir pada ${getMonthName(selectedPeriod)}</h3>
        ${content}
      </body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Perubahan_Modal_${selectedPeriod}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const content = getReportContent();
    if (!content) return alert("Laporan belum tersedia.");
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:5px}</style>
        </head>
        <body>
          <table>
            <tr><td colspan="2" style="text-align:center;font-weight:bold;">HSEO GROUP</td></tr>
            <tr><td colspan="2" style="text-align:center;">Laporan Perubahan Modal</td></tr>
            <tr><td colspan="2" style="text-align:center;">Untuk Periode yang Berakhir pada ${getMonthName(selectedPeriod)}</td></tr>
          </table>
          ${content}
        </body>
      </html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Perubahan_Modal_${selectedPeriod}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- RENDER ---
  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex min-h-screen pt-15">
        <Sidebar />
        <div className="flex-1 p-6">
          <Navbar hideMenu />
          <main className="flex-1 p-6 bg-gray-100">
            <div className="flex justify-between items-center mb-6 no-print">
              <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
                Laporan Perubahan Modal
              </h1>
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
                        <Image src="/pdf-file.png" alt="PDF" width={18} height={18} /> PDF
                      </button>
                      <button
                        onClick={() => {
                          handleExportDoc();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                      >
                        <Image src="/document.png" alt="Doc" width={18} height={18} /> Word
                      </button>
                      <button
                        onClick={() => {
                          handleExportExcel();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                      >
                        <Image src="/excel.png" alt="Excel" width={18} height={18} /> Excel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FORM */}
            <form
              onSubmit={handleShowReport}
              className="bg-white p-6 rounded-lg shadow-md mb-6 report-form no-print"
            >
              <h2 className="text-xl font-bold mb-4">Pilih Periode Laporan</h2>
              <div className="mb-4">
                <label className="block mb-2 font-medium" htmlFor="periode">
                  Periode:
                </label>
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

            {/* LAPORAN */}
            {reportData && (
              <div
                id="laporan-perubahan-modal"
                className="printable-report bg-white p-6 sm:p-10 rounded-lg shadow-md max-w-3xl mx-auto"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-1">Laporan Perubahan Modal</h2>
                  <h3 className="text-lg">
                    Untuk Periode yang Berakhir pada {getMonthName(selectedPeriod)}
                  </h3>
                </div>

                <table className="w-full text-base">
                  <tbody>
                    <tr className="font-bold">
                      <td className="p-2 w-3/5">{reportData.modalAccountName} (Awal)</td>
                      <td className="p-2 w-2/5 text-right">
                        {formatCurrency(reportData.modalAwal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-6">
                        {reportData.labaBersih >= 0 ? "Laba Bersih" : "Rugi Bersih"}
                      </td>
                      <td className="p-2 text-right border-b border-gray-400">
                        {formatCurrency(reportData.labaBersih)}
                      </td>
                    </tr>
                    <tr className="font-medium">
                      <td className="p-2"></td>
                      <td className="p-2 text-right">
                        {formatCurrency(reportData.modalAwal + reportData.labaBersih)}
                      </td>
                    </tr>
                    <tr className="pt-2">
                      <td className="p-2 pl-6">{reportData.priveAccountName}</td>
                      <td className="p-2 text-right border-b border-gray-400">
                        {formatCurrency(reportData.totalPrive, true)}
                      </td>
                    </tr>
                    <tr className="font-bold text-lg">
                      <td className="p-2 pt-4">{reportData.modalAccountName} (Akhir)</td>
                      <td className="p-2 pt-4 text-right border-t-2 border-b-2 border-black">
                        {formatCurrency(reportData.modalAkhir)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default EquityChangePage;
