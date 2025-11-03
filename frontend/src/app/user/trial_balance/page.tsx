"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import Image from "next/image";
import AuthGuard from "@/app/components/AuthGuard/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller"; 

// Mendefinisikan interfaces
interface Coa { 
    id: number; 
    code_account: string; 
    account: string; 
}

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
    nomor_bukti: string; 
    date: string; 
    description: string; 
    lampiran: string; 
    referensi: string; 
    entries: Entry[]; 
}

interface SaldoAkun { 
    code_account: string; 
    account: string; 
    saldoAkhir: number; 
    jenisAkun: string; 
}

// Data Bulan untuk konversi label
const monthLabels: { [key: string]: string } = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};
const months = Object.entries(monthLabels).map(([value, label]) => ({ value, label }));

// =========================================================================
//                  KOMPONEN UTAMA (Neraca Saldo Page)
// =========================================================================

const NeracaSaldoPage = () => {
  const [dataNeracaSaldo, setDataNeracaSaldo] = useState<SaldoAkun[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref untuk konten yang akan dicetak (disembunyikan)
  const reportRef = useRef<HTMLDivElement>(null);
  // Data Master
  const [allJournals, setAllJournals] = useState<Journal[]>([]);
  const [coaMap, setCoaMap] = useState<Map<string, string>>(new Map());
  // Data untuk Filter
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // State Filter
  const initialYear = new Date().getFullYear().toString();
  const initialMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);


  /**
   * --- 1. Fetching Awal Data & Menentukan Tahun yang Tersedia ---
   */
  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

            const axiosClient = new AxiosCaller("http://localhost:3001");
            const [journalsRes, coaRes] = await Promise.all([
                axiosClient.call["GET /journals"]({ headers: { authorization: token }, query: { limit: 9999 } }),
                axiosClient.call["GET /coa"]({ headers: { authorization: token }, query: { limit: 9999 } }),
            ]);

            const journals = journalsRes as unknown as Journal[];
            const coaList = coaRes as unknown as Coa[];

            setAllJournals(journals);
            setCoaMap(new Map(coaList.map((c) => [c.code_account, c.account])));
            
            const uniqueYears = new Set<string>();
            let latestDate = '0000-00-00';

            journals.forEach(j => {
                if (j.date && j.date.length >= 4) {
                    const year = j.date.substring(0, 4);
                    uniqueYears.add(year);
                    if (j.date > latestDate) {
                        latestDate = j.date;
                    }
                }
            });

            const sortedYears = Array.from(uniqueYears).sort((a, b) => parseInt(b) - parseInt(a));
            setAvailableYears(sortedYears);

            if (latestDate !== '0000-00-00') {
                const latestYear = latestDate.substring(0, 4);
                const latestMonth = latestDate.substring(5, 7);
                
                setSelectedYear(latestYear);
                setSelectedMonth(latestMonth);
            } else {
                setSelectedYear(initialYear);
                setSelectedMonth(initialMonth);
            }
            
        } catch (error) {
            console.error("Gagal mengambil Data Master:", error);
        }
    };
    fetchData();
  }, []);

  /**
   * --- 2. Logika Perhitungan Neraca Saldo (KUMULATIF) ---
   */
  useEffect(() => {
    if (allJournals.length === 0 || coaMap.size === 0 || !selectedYear || !selectedMonth) {
        setDataNeracaSaldo([]);
        setTotalDebit(0);
        setTotalCredit(0);
        return;
    }

    const calculateNeracaSaldo = () => {
        setIsLoading(true);

        const yearInt = parseInt(selectedYear);
        const monthInt = parseInt(selectedMonth);
        
        if (isNaN(yearInt) || isNaN(monthInt)) {
            setDataNeracaSaldo([]);
            setTotalDebit(0);
            setTotalCredit(0);
            setIsLoading(false);
            return;
        }

        const lastDayOfMonth = new Date(yearInt, monthInt, 0).getDate();
        const endFilterDateString = `${selectedYear}-${selectedMonth}-${lastDayOfMonth.toString().padStart(2, '0')}`;
        
        const filteredJournals = allJournals.filter(j => j.date <= endFilterDateString);
        const saldoMap = new Map<string, SaldoAkun>();
        
        for (const journal of filteredJournals) {
            for (const entry of journal.entries) {
                const code = entry.code_account;
                const accountName = coaMap.get(code) || `(Akun ${code} Tidak Ditemukan)`;

                if (!saldoMap.has(code)) {
                    saldoMap.set(code, {
                        code_account: code,
                        account: accountName,
                        saldoAkhir: 0,
                        jenisAkun: code.charAt(0),
                    });
                }

                const currentSaldo = saldoMap.get(code)!;
                currentSaldo.saldoAkhir += (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
            }
        }

        const finalData = Array.from(saldoMap.values())
            .filter(akun => akun.saldoAkhir !== 0)
            .sort((a, b) => a.code_account.localeCompare(b.code_account));

        let totalD = 0;
        let totalC = 0;
        for (const akun of finalData) {
            if (akun.saldoAkhir > 0) {
                totalD += akun.saldoAkhir;
            } else {
                totalC += Math.abs(akun.saldoAkhir);
            }
        }

        setDataNeracaSaldo(finalData);
        setTotalDebit(totalD);
        setTotalCredit(totalC);
        setIsLoading(false);
    };

    calculateNeracaSaldo();
  }, [selectedMonth, selectedYear, allJournals, coaMap]);

  // Helper untuk format mata uang (Mengganti 0 dengan strip)
  const formatRupiah = (amount: number, useStripForZero: boolean = true): string => {
    const absAmount = Math.abs(amount);
    
    if (absAmount === 0 && useStripForZero) {
        return "-";
    }
    
    const formatted = absAmount.toLocaleString("id-ID");
    return formatted.replace(/,/g, 'X').replace(/\./g, ',').replace(/X/g, '.');
  };
  
  // Menghitung tanggal terakhir bulan yang dipilih
  const displayLastDay = useMemo(() => {
    const yearInt = parseInt(selectedYear);
    const monthInt = parseInt(selectedMonth);
    if (isNaN(yearInt) || isNaN(monthInt)) return 'XX';
    return new Date(yearInt, monthInt, 0).getDate().toString().padStart(2, '0');
  }, [selectedYear, selectedMonth]);

  const NAMA_PERUSAHAAN = "HSEO GROUP";
  
  // =========================================================================
  //                  FUNGSI EXPORT PDF
  // =========================================================================
  const handleExportPDF = () => {
    const content = reportRef.current;
    if (!content) return;

    content.style.display = "block";
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head><title>Neraca Saldo</title></head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
    content.style.display = "none";
  };

  const handleExportExcel = () => {
    const content = reportRef.current;
    if (!content) return;
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <h2>${NAMA_PERUSAHAAN}</h2>
      <h3>Neraca Saldo</h3>
      <p>Per ${displayLastDay} ${monthLabels[selectedMonth]} ${selectedYear}</p>
      ${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Neraca_Saldo_${selectedMonth}_${selectedYear}.xls`;
    a.click();
  };

  const handleExportDoc = () => {
    const content = reportRef.current;
    if (!content) return;
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <h2>${NAMA_PERUSAHAAN}</h2>
      <h3>Neraca Saldo</h3>
      <p>Per ${displayLastDay} ${monthLabels[selectedMonth]} ${selectedYear}</p>
      ${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Neraca_Saldo_${selectedMonth}_${selectedYear}.doc`;
    a.click();
  };
  
  // =========================== RENDERING UI ==============================
  return (
    <AuthGuard>
    <div className="flex min-h-screen pt-14">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Neraca Saldo
          </h1>
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
        </div>

        <main className="flex items-center justify-between space-x-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-700">Periode:</h2>

            <select
              className="p-2 border border-gray-300 rounded-md"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded-md"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.length === 0 ? (
                <option value={initialYear}>{initialYear}</option>
              ) : (
                availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))
              )}
            </select>
          </div>
        </main>

        <p className="mb-4 text-sm text-gray-600">
          Neraca Saldo per tanggal{" "}
          <strong>
            {displayLastDay} {monthLabels[selectedMonth]} {selectedYear}
          </strong>
          .
        </p>

        {/* Hidden untuk export */}
        <div ref={reportRef} style={{ display: "none" }}>
          <ReportHeader
            companyName={NAMA_PERUSAHAAN}
            reportDate={`${displayLastDay} ${monthLabels[selectedMonth]} ${selectedYear}`}
          />
          <ReportTable
            data={dataNeracaSaldo}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            formatRupiah={formatRupiah}
          />
        </div>

        {/* Tabel tampil di layar */}
        <WebTable
          data={dataNeracaSaldo}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
          formatRupiah={formatRupiah}
        />
      </div>
    </div>
    </AuthGuard>
  );
};

export default NeracaSaldoPage;

// =========================================================================
//                  KOMPONEN REPORT DAN TABEL PDF (ISOLASI STYLE)
// =========================================================================

interface ReportHeaderProps {
    companyName: string;
    reportDate: string;
}

// Hapus class Tailwind, ganti dengan style inline CSS dasar
const ReportHeader: React.FC<ReportHeaderProps> = ({ companyName, reportDate }) => (
    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{companyName}</h2>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>NERACA SALDO</h3>
        <p style={{ fontSize: '12px' }}>PER {reportDate.toUpperCase()}</p>
    </div>
);

interface TableProps {
    data: SaldoAkun[];
    totalDebit: number;
    totalCredit: number;
    formatRupiah: (amount: number, useStripForZero?: boolean) => string;
}

// Hapus class Tailwind, ganti dengan style inline CSS dasar & Hex Code
const ReportTable: React.FC<TableProps> = ({ data, totalDebit, totalCredit, formatRupiah }) => {
    const isBalanced = totalDebit === totalCredit;
    
    return (
        
        <table style={{ 
            width: '100%', 
            fontSize: '10px', 
            borderCollapse: 'collapse', 
            border: '1px solid black',
            fontFamily: 'Arial, sans-serif'
        }}>
            <thead>
                <tr style={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    borderBottom: '1px solid black', 
                    backgroundColor: '#f0f0f0' 
                }}>
                    <th style={{ padding: '8px', width: '10%', borderRight: '1px solid black' }}>No. Kode</th>
                    <th style={{ padding: '8px', width: '40%', borderRight: '1px solid black' }}>Nama Akun</th>
                    <th style={{ padding: '8px', width: '25%', borderRight: '1px solid black' }}>Debit</th>
                    <th style={{ padding: '8px', width: '25%' }}>Kredit</th>
                </tr>
            </thead>
            <tbody>
                {data.map((akun, index) => (
                    <tr key={akun.code_account} style={{ borderBottom: '1px solid #ccc', backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid black' }}>{akun.code_account}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid black' }}>{akun.account}</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', borderRight: '1px solid black' }}>
                            Rp {akun.saldoAkhir > 0 ? formatRupiah(akun.saldoAkhir, true) : '-'}
                        </td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                            Rp {akun.saldoAkhir < 0 ? formatRupiah(akun.saldoAkhir, true) : '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr style={{ 
                    fontWeight: 'bold', 
                    borderTop: '2px solid black', 
                    backgroundColor: '#38b000', // Dark Green
                    color: 'white' 
                }}>
                    <td colSpan={2} style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid black' }}>
                        TOTAL 
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid black' }}>
                        Rp {formatRupiah(totalDebit, false)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                        Rp {formatRupiah(totalCredit, false)}
                    </td>
                </tr>
                <tr style={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    backgroundColor: isBalanced ? '#10b981' : '#fecaca',
                    color: isBalanced ? 'white' : 'red',
                    fontSize: '10px'
                }}>
                    <td colSpan={4} style={{ padding: '4px 8px' }}>
                        {isBalanced ? "Neraca Saldo Seimbang (BALANCE) ✅" : `PERHATIAN: TIDAK Seimbang! Selisih: ${formatRupiah(totalDebit - totalCredit, false)} ❌`}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};

// =========================================================================
//                  KOMPONEN TABEL WEB (WebTable)
// =========================================================================

const WebTable: React.FC<TableProps> = ({ data, totalDebit, totalCredit, formatRupiah }) => {
    const isBalanced = totalDebit === totalCredit;
    
    return (
        <div className="bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-900 text-green-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-1/12 border-r border-green-200">Kode Akun</th>
                    <th className="px-4 py-3 text-left w-5/12 border-r border-green-200">Nama Akun</th>
                    <th className="px-4 py-3 text-right w-3/12 border-r border-green-200">Debit (Rp)</th>
                    <th className="px-4 py-3 text-right w-3/12 border-r border-green-200">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((akun, index) => (
                    <tr
                      key={akun.code_account}
                      className={`border-b hover:bg-gray-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 font-mono border-r border-gray-200">
                        {akun.code_account}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">{akun.account}</td>
                      <td className="px-4 py-2 text-right text-green-700 font-medium border-r border-gray-200">
                        {/* Menggunakan strip untuk nol */}
                        {akun.saldoAkhir > 0 ? formatRupiah(akun.saldoAkhir, false) : "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-red-700 font-medium border-r border-gray-200">
                        {/* Menggunakan strip untuk nol */}
                        {akun.saldoAkhir < 0 ? formatRupiah(akun.saldoAkhir, false) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Bagian Total */}
                <tfoot>
                  <tr className="bg-green-200 font-bold text-base">
                    <td colSpan={2} className="px-4 py-3 text-center text-gray-800 border-r border-gray-300 ">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 border-r border-gray-300 ">
                      {formatRupiah(totalDebit, false)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 border-r border-gray-200 ">
                      {formatRupiah(totalCredit, false)}
                    </td>
                  </tr>
                  <tr
                    className={`font-bold text-center ${
                      isBalanced
                        ? "bg-stone-900 text-white"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    <td colSpan={4} className="px-4 py-2">
                      {isBalanced
                        ? "NERACA SALDO SEIMBANG (BALANCE) ✅"
                        : `PERHATIAN: NERACA SALDO TIDAK SEIMBANG! SELISIH: ${formatRupiah(
                            totalDebit - totalCredit, false
                          )} ❌`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
    );
}