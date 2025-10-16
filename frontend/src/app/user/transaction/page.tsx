"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import axios from "axios";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";

interface Coa {
  id: number;
  code_account: string;
  account: string;
  jenis: string;
  description: string;
  normal_balance: string;
}

interface TransactionRow {
  id: number;
  akunId: number | null;
  debit: number;
  credit: number;
  isSelected: boolean;
}

const transactionPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tanggalTransaksi, setTanggalTransaksi] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [referensi, setReferensi] = useState("");
  const [deskripsiUmum, setDeskripsiUmum] = useState("");
  const [lampiran, setLampiran] = useState<File | null>(null);
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [coaList, setCoaList] = useState<Coa[]>([]);



  // Logic
  const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);
  const selisih = totalDebit - totalCredit;

  // === Responsif Sidebar ===
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // === Ambil data akun dari backend ===
  useEffect(() => {
    const fetchAkun = async () => {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

      try {
        const res = await new AxiosCaller("http://localhost:3001").call[
          "GET /coa"
        ]({
          headers: { authorization: token },
          query: {},
        });
        setCoaList(res);
      } catch (error) {
        console.error("Gagal memuat daftar akun:", error);
      }
    };
    fetchAkun();
  }, []);

  const handleInputChange = (
    id: number,
    field: keyof TransactionRow,
    value: string | number
  ) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          let newDebit = row.debit;
          let newCredit = row.credit;

          if (field === "debit") {
            newDebit = Number(value) || 0;
            newCredit = newDebit > 0 ? 0 : newCredit;
          } else if (field === "credit") {
            newCredit = Number(value) || 0;
            newDebit = newCredit > 0 ? 0 : newDebit;
          }

          return { ...row, [field]: value, debit: newDebit, credit: newCredit };
        }
        return row;
      })
    );
  };

  const handleSelectRow = (id: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  const handleAddRow = () => {
    const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
    setRows((prev) => [
      ...prev,
      { id: newId, akunId: null, debit: 0, credit: 0, isSelected: false },
    ]);
  };

  const handleDeleteSelected = () => {
    setRows((prev) => prev.filter((r) => !r.isSelected));
  };

  const handleSimpanDraft = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");
    try {
      const res = await new AxiosCaller("http://localhost:3001").call[
        "GET /journals"
      ];
      alert("Draft berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal simpan draft.");
    }
  };

  const handleReset = () => {
    setTanggalTransaksi(new Date().toISOString().substring(0, 10));
    setReferensi("");
    setDeskripsiUmum("");
    setLampiran(null);
    setRows([]);
  };

  return (
    <>
      <div className="flex min-h-screen">
        {/* Tombol ☰ hanya muncul di mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        >
          ☰
        </button>

        {/* Sidebar tampil permanen di layar besar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Konten utama */}
        <main className="flex-1 container mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md text-black overflow-y-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-green-200 p-2 md:p-3 flex items-center justify-center rounded-md">
            Transaksi
          </h1>

          {/* === Form transaksi === */}
          <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={tanggalTransaksi}
                  onChange={(e) => setTanggalTransaksi(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nomor Bukti</label>
                <input
                  type="text"
                  // value={nomorBukti}
                  disabled
                  className="mt-1 p-2 w-full border bg-gray-100 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Referensi</label>
                <input
                  type="text"
                  value={referensi}
                  onChange={(e) => setReferensi(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                  placeholder="No Invoice / PO"
                />
              </div>
            </div>

            <label className="block text-sm font-medium">Deskripsi Umum</label>
            <textarea
              value={deskripsiUmum}
              onChange={(e) => setDeskripsiUmum(e.target.value)}
              rows={3}
              className="mt-1 p-2 w-full border rounded resize-none mb-4"
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Lampiran</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setLampiran(e.target.files ? e.target.files[0] : null)
                  }
                />
                <span className="text-sm text-gray-500">
                  {lampiran ? lampiran.name : "Tidak ada file"}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Reset
                </button>
                <button
                  onClick={handleSimpanDraft}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Simpan Draft
                </button>
                <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 font-semibold">
                  Posting
                </button>
              </div>
            </div>
          </div>

          {/* === Tabel Transaksi === */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Tambah Baris
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={rows.filter((r) => r.isSelected).length === 0}
                className={`px-4 py-2 rounded text-white transition ${
                  rows.filter((r) => r.isSelected).length === 0
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Hapus Baris
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold w-12">
                      No
                    </th>
                    <th className="p-2 text-left text-xs font-semibold">
                      Akun
                    </th>
                    <th className="p-2 text-right text-xs font-semibold w-1/4">
                      Debit
                    </th>
                    <th className="p-2 text-right text-xs font-semibold w-1/4">
                      Kredit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map((row, i) => (
                      <tr key={row.id} className="border-t">
                        <td className="p-2 text-sm">
                          <input
                            type="checkbox"
                            checked={row.isSelected}
                            onChange={() => handleSelectRow(row.id)}
                            className="mr-2"
                          />
                          {i + 1}
                        </td>
                        <td className="p-2">
                          <select
                            value={row.akunId ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "akunId",
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Pilih Akun</option>
                            {coaList.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code_account} - {a.account}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.debit > 0 ? row.debit : ""}
                            onChange={(e) =>
                              handleInputChange(row.id, "debit", e.target.value)
                            }
                            className="w-full p-1 border rounded text-right"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.credit > 0 ? row.credit : ""}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "credit",
                                e.target.value
                              )
                            }
                            className="w-full p-1 border rounded text-right"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-3 text-gray-500"
                      >
                        Belum ada baris transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 mt-4 font-semibold">
              <span>
                Total Debit:{" "}
                {totalDebit.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </span>
              <span>
                Total Kredit:{" "}
                {totalCredit.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </span>
              <span
                className={`px-2 rounded ${
                  selisih === 0
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                Selisih:{" "}
                {selisih.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default transactionPage;
