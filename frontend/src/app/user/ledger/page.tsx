"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import { useRouter } from "next/navigation";

interface Entry {
  id_coa: number;
  code_account: string;
  debit: number;
  credit: number;
  description?: string;
}

interface Coa {
  id: number;
  code_account: string;
  account: string;
  jenis: string;
  description: string;
  normal_balance: "Debit" | "Kredit";
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

interface LedgerEntry {
  id: number;
  tanggal: string;
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
  deskripsi: string;
}

interface CalculatedEntry extends LedgerEntry {
  saldoDebit: number;
  saldoKredit: number;
}

const LedgerPage = () => {
  const [coaList, setCoaList] = useState<Coa[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedAkun, setSelectedAkun] = useState<Coa | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);
      const axios = new AxiosCaller("http://localhost:3001");
      const coaRes = await axios.call["GET /coa"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });
      const journalRes = await axios.call["GET /journals"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      setCoaList(coaRes as Coa[]);
      setJournals(journalRes as unknown as Journal[]);
    } catch (err) {
      console.error("Gagal memuat data buku besar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setSelectedAkun(null);
      return;
    }

    const found = coaList.find(
      (a) =>
        a.code_account.toLowerCase() === searchInput.toLowerCase() ||
        a.account.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (found) {
      setSelectedAkun(found);
    } else {
      alert(`Akun "${searchInput}" tidak ditemukan.`);
      setSelectedAkun(null);
    }
  };

  const hitungSaldo = (data: LedgerEntry[], akun: Coa): CalculatedEntry[] => {
    if (!akun) return [];
    let saldo = 0;
    const result: CalculatedEntry[] = [];

    data.forEach((item) => {
      if (akun.normal_balance === "Debit") {
        saldo += item.debit - item.kredit;
      } else {
        saldo += item.kredit - item.debit;
      }

      const saldoDebit =
        saldo >= 0 && akun.normal_balance === "Debit"
          ? saldo
          : saldo < 0 && akun.normal_balance === "Kredit"
          ? Math.abs(saldo)
          : 0;
      const saldoKredit =
        saldo >= 0 && akun.normal_balance === "Kredit"
          ? saldo
          : saldo < 0 && akun.normal_balance === "Debit"
          ? Math.abs(saldo)
          : 0;

      result.push({
        ...item,
        saldoDebit,
        saldoKredit,
      });
    });

    return result;
  };

  const ledgerEntries: LedgerEntry[] = [];
  journals.forEach((j) => {
    j.entries.forEach((e) => {
      ledgerEntries.push({
        id: j.id,
        tanggal: j.date,
        kode_akun: e.code_account,
        nama_akun:
          coaList.find((c) => c.code_account === e.code_account)?.account ||
          "-",
        debit: e.debit,
        kredit: e.credit,
        deskripsi: j.description,
      });
    });
  });

  const filtered = selectedAkun
    ? ledgerEntries.filter((i) => i.kode_akun === selectedAkun.code_account)
    : [];

  const calculated = selectedAkun ? hitungSaldo(filtered, selectedAkun) : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-50 to-green-50">
      <Sidebar />
      <main className="flex-1">
        <Navbar hideMenu />
        <div className="container mx-auto p-6 bg-white rounded-2xl shadow-lg text-gray-800 mt-16">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-700 to-emerald-500 text-white py-3 rounded-xl mb-6 shadow-md">
            Buku Besar
          </h1>

          {/* Search */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-6">
            <label htmlFor="search" className="font-medium text-green-800">
              Cari Akun (Kode/Nama):
            </label>
            <input
              id="search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Contoh: 101 atau Kas"
              className="border border-green-300 focus:ring-2 focus:ring-green-400 rounded-lg p-2 w-full md:w-64 outline-none transition"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg shadow-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
              }`}
            >
              Cari
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center text-gray-500 italic">Memuat data...</p>
          ) : !selectedAkun ? (
            <p className="text-center text-red-500 italic font-semibold">
              Silakan cari akun untuk menampilkan Buku Besar.
            </p>
          ) : (
            <div className="bg-gradient-to-br from-lime-100 to-green-100 p-6 rounded-2xl shadow-xl border border-green-200">
              <h2 className="text-lg font-bold text-center text-green-900">
                Akun: {selectedAkun.code_account} - {selectedAkun.account}
              </h2>
              <p className="text-center text-green-700 mb-4">
                Saldo Normal:{" "}
                <span className="font-semibold">
                  {selectedAkun.normal_balance}
                </span>
              </p>

              <div className="overflow-x-auto max-h-[420px] rounded-lg border border-green-200">
                <table className="min-w-full text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-green-700 to-emerald-600 text-white sticky top-0 shadow-md">
                    <tr>
                      <th className="p-3 text-left">Tanggal</th>
                      <th className="p-3 text-left">Kode Akun</th>
                      <th className="p-3 text-left">Deskripsi</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Kredit</th>
                      <th className="p-3 text-right bg-green-800/40">
                        Saldo Debit
                      </th>
                      <th className="p-3 text-right bg-green-800/40">
                        Saldo Kredit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculated.length > 0 ? (
                      calculated.map((item, i) => (
                        <tr
                          key={i}
                          className="border-t border-green-100 hover:bg-green-50 transition-colors"
                        >
                          <td className="p-2">{item.tanggal}</td>
                          <td className="p-2">{item.kode_akun}</td>
                          <td className="p-2">{item.deskripsi}</td>
                          <td className="p-2 text-right text-green-700 font-medium">
                            {item.debit
                              ? item.debit.toLocaleString("id-ID")
                              : "-"}
                          </td>
                          <td className="p-2 text-right text-red-700 font-medium">
                            {item.kredit
                              ? item.kredit.toLocaleString("id-ID")
                              : "-"}
                          </td>
                          <td
                            className={`p-2 text-right ${
                              item.saldoDebit > 0
                                ? "text-green-800 font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            {item.saldoDebit.toLocaleString("id-ID")}
                          </td>
                          <td
                            className={`p-2 text-right ${
                              item.saldoKredit > 0
                                ? "text-red-800 font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            {item.saldoKredit.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-4 text-gray-500 italic"
                        >
                          Tidak ada transaksi untuk akun ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LedgerPage;
