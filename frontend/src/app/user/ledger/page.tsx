"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import Image from "next/image";

const BukuBesarPage = () => {
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
  date: string;
  description: string;
  lampiran: string;
  referensi: string;
  entries: Entry[];
}

interface BukuBesarPerAkun {
  code_account: string;
  account: string;
  entries: {
    tanggal: string;
    deskripsi: string;
    debit: number;
    credit: number;
    saldo: number;
  }[];
}

  const [dataBukuBesar, setDataBukuBesar] = useState<BukuBesarPerAkun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBukuBesar = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Token tidak ditemukan. Silakan login ulang.");
          return;
        }

        const axiosClient = new AxiosCaller("http://localhost:3001");

        const journalsRes = await axiosClient.call["GET /journals"]({
          headers: { authorization: token },
          query: { limit: 9999 },
        });
        const journals = journalsRes as unknown as Journal[];

        const coaRes = await axiosClient.call["GET /coa"]({
          headers: { authorization: token },
          query: { limit: 9999 },
        });
        const coaList = coaRes as unknown as Coa[];

        const coaMap = new Map(coaList.map((c) => [c.code_account, c.account]));

        const allEntries = journals.flatMap((j) =>
          j.entries.map((e) => ({
            code_account: e.code_account,
            account: coaMap.get(e.code_account) || "(Tidak ditemukan)",
            tanggal: j.date,
            deskripsi: j.description,
            debit: Number(e.debit) || 0,
            credit: Number(e.credit) || 0,
          }))
        );

        const filteredEntries = allEntries.filter((e) => {
          const date = new Date(e.tanggal);
          const afterStart = startDate ? date >= new Date(startDate) : true;
          const beforeEnd = endDate ? date <= new Date(endDate) : true;
          return afterStart && beforeEnd;
        });

        const grouped = new Map<string, BukuBesarPerAkun>();
        for (const item of filteredEntries) {
          const key = `${item.code_account}-${item.account}`;
          if (!grouped.has(key)) {
            grouped.set(key, {
              code_account: item.code_account,
              account: item.account,
              entries: [],
            });
          }

          grouped.get(key)!.entries.push({
            tanggal: item.tanggal,
            deskripsi: item.deskripsi,
            debit: item.debit,
            credit: item.credit,
            saldo: 0,
          });
        }

        const finalData: BukuBesarPerAkun[] = [];
        for (const [, akun] of grouped) {
          let saldo = 0;
          akun.entries.sort(
            (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
          );
          akun.entries = akun.entries.map((e) => {
            saldo += e.debit - e.credit;
            return { ...e, saldo };
          });
          finalData.push(akun);
        }

        setDataBukuBesar(finalData);
      } catch (error) {
        console.error("Gagal mengambil Buku Besar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBukuBesar();
  }, [startDate, endDate]);

  // === Export Functions ===
  const handleExportPDF = () => {
    const content = document.getElementById("all-ledger-content");
    if (!content) return;
    const newWindow = window.open("", "_blank");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Buku Besar - PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #444; padding: 6px 8px; font-size: 12px; }
            th { background: #eee; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Buku Besar Semua Akun</h2>
          ${content.innerHTML}
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
  };

  const handleExportExcel = () => {
    const content = document.getElementById("all-ledger-content");
    if (!content) return;
    const html = content.innerHTML;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buku_besar_semua_akun.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDoc = () => {
    const content = document.getElementById("all-ledger-content");
    if (!content) return;
    const html = `
      <html><head><meta charset="utf-8"></head><body>
      <h2>Buku Besar Semua Akun</h2>${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buku_besar.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Sidebar />
<<<<<<< HEAD
      <div className="flex-1 p-6">
        <Navbar hideMenu />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Buku Besar</h1>
=======
      <div className="flex-1 p-6 relative">
        <Navbar />
        <div className="flex justify-between items-center mb-4 pt-15">
          <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
            Buku Besar
            </h1>

          <div className="flex items-center gap-3 relative">
          <h3 className="text-base font-normal bg-stone-200 px-6 py-2 rounded-md shadow-sm">
            <span>Mulai Dari</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border mx-3 border-gray-300 rounded px-2 py-1"
              />
            <span> Sampai Dengan</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border mx-3 border-gray-300 rounded px-2 py-1"
            />
              </h3>

            {/* Dropdown Export */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-white px-3 py-1 rounded hover:bg-stone-200 text-sm"
              >
                <Image
                  src="/printer.png"
                  alt="Print Icon"
                  width={30}
                  height={30}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-30 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/pdf-file.png"
                      alt="PDF Icon"
                      width={18}
                      height={18}
                    />
                  Download PDF
                  </button>
                  <button
                    onClick={() => {
                      handleExportDoc();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/document.png"
                      alt="Document Icon"
                      width={18}
                      height={18}
                    />
                  Download Document
                  </button>
                  <button
                    onClick={() => {
                      handleExportExcel();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/excel.png"
                      alt="Excel Icon"
                      width={18}
                      height={18}
                    />
                  Download Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
>>>>>>> cc3284e7f09394e290cb74139ed013e1c5fce6c3

        {isLoading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div id="all-ledger-content" className="space-y-10">
            {dataBukuBesar.map((akun) => (
              <div
                key={akun.code_account}
                className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-center bg-green-200 px-4 py-2 border-b">
                  <h2 className="font-semibold text-gray-800">
                    {akun.code_account} - {akun.account}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-800 text-green-200 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Tanggal</th>
                        <th className="px-4 py-2 text-left">Deskripsi</th>
                        <th className="px-4 py-2 text-right">Debit</th>
                        <th className="px-4 py-2 text-right">Kredit</th>
                        <th className="px-4 py-2 text-right">Saldo Debit</th>
                        <th className="px-4 py-2 text-right">Saldo Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {akun.entries.map((entry, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {new Date(entry.tanggal).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-4 py-2">{entry.deskripsi}</td>
                          <td className="px-4 py-2 text-right">
                            {entry.debit ? entry.debit.toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {entry.credit ? entry.credit.toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-right text-green-600">
                            {entry.saldo > 0 ? entry.saldo.toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-right text-red-600">
                            {entry.saldo < 0
                              ? Math.abs(entry.saldo).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BukuBesarPage;
