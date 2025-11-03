// ==========================================
// File: JournalPage.tsx
// Deskripsi: Halaman utama untuk menampilkan daftar jurnal umum,
// menampilkan detail jurnal, serta mengedit atau menghapus jurnal.
// Menggunakan React + Next.js + AxiosCaller.
// ==========================================

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import Link from "next/link";


// ================== INTERFACE ==================
// Struktur data untuk entri jurnal
interface Entry {
  id_coa: number;
  code_account: string;
  account: string;
  debit: number;
  credit: number;
}

// Struktur data untuk jurnal utama
interface Journal {
  id: number;
  date: string;
  description: string;
  referensi: string;
  lampiran: string;
  nomor_bukti: string;
  entries: Entry[];
}

// Struktur data untuk Chart of Account (COA)
interface Coa {
  id: number;
  code_account: string;
  account: string;
  jenis: string;
}


// ================== KOMPONEN UTAMA ==================
const JournalPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [coaList, setCoaList] = useState<Coa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // State untuk Modal Detail dan Edit
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null); // Untuk Modal Detail
  const [editModalOpen, setEditModalOpen] = useState(false); // Untuk Modal Edit
  const [editData, setEditData] = useState<Journal | null>(null); // Data yang sedang diedit

  const router = useRouter();

  // ================== UTILS ==================
  // Fungsi untuk mencari detail akun COA berdasarkan id
  const findCoaDetail = (id_coa: number) => {
    return coaList.find((c) => c.id === id_coa);
  };

  // ================== FETCH DATA ==================
  // Mengambil data jurnal dan COA dari server menggunakan AxiosCaller
  const fetchJournals = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);

      // Ambil semua jurnal dari endpoint /journals
      const journalRes = await new AxiosCaller("http://localhost:3001").call["GET /journals"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      // Ambil semua akun COA dari endpoint /coa
      const coaRes = await new AxiosCaller("http://localhost:3001").call["GET /coa"]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      setCoaList(coaRes as Coa[]);

      // Mapping COA agar mudah digunakan
      const coaMap = new Map<number, { account: string; code_account: string }>();
      coaRes.forEach((c: any) => {
        coaMap.set(c.id, { account: c.account, code_account: c.code_account });
      });

      // Gabungkan data jurnal dan COA agar setiap entry punya nama akun & kode akun
      const merged = (journalRes as any[]).map((journal) => ({
        ...journal,
        entries: journal.entries.map((entry: any) => ({
          ...entry,
          account: coaMap.get(entry.id_coa)?.account || "-",
          code_account: coaMap.get(entry.id_coa)?.code_account || entry.code_account,
        })),
      }));

      setJournals(merged as Journal[]);
    } catch (err) {
      console.error("Gagal ambil data jurnal:", err);
      setError("Gagal memuat data jurnal");
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetch data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchJournals();
  }, []);

  // ================== DELETE ==================
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    try {
      await new AxiosCaller("http://localhost:3001").call["DELETE /journals/:id"]({
        headers: { authorization: token },
        paths: { id },
      });
      alert("Jurnal berhasil dihapus!");
      await fetchJournals();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus jurnal!");
    }
    setDropdownOpen(null); // Tutup dropdown setelah aksi
  };

  // ================== EDIT POPUP HANDLERS ==================
  const handleEditClick = (journal: Journal) => {
    setEditData({ ...journal });
    setEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleEditChange = (field: keyof Journal, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleEntryChange = (index: number, field: keyof Entry, value: string | number) => {
    if (!editData) return;
    const updatedEntries = editData.entries.map((entry, i) => {
      if (i === index) {
        let newEntry = { ...entry };

        // Jika mengubah id_coa, maka ubah juga nama & kode akun
        if (field === "id_coa") {
          const coa = findCoaDetail(Number(value));
          newEntry = {
            ...newEntry,
            id_coa: Number(value),
            code_account: coa?.code_account || "",
            account: coa?.account || "",
          };
        } else {
          newEntry = {
            ...newEntry,
            [field]: field === "debit" || field === "credit" ? Number(value) : value,
          };
        }
        return newEntry;
      }
      return entry;
    });
    setEditData({ ...editData, entries: updatedEntries });
  };

  const handleRemoveRow = (index: number) => {
    if (!editData) return;
    const updatedEntries = editData.entries.filter((_, i) => i !== index);
    setEditData({ ...editData, entries: updatedEntries });
  };

  const handleAddRow = () => {
    if (!editData) return;
    const newEntry: Entry = {
      id_coa: 0,
      code_account: "",
      account: "",
      debit: 0,
      credit: 0,
    };
    setEditData({ ...editData, entries: [...editData.entries, newEntry] });
  };

  // Simpan hasil edit ke server
  const handleSaveEdit = async () => {
    if (!editData) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    // Validasi keseimbangan Debit/Kredit
    const totalDebit = editData.entries.reduce((sum, e) => sum + Number(e.debit), 0);
    const totalCredit = editData.entries.reduce((sum, e) => sum + Number(e.credit), 0);
    if (totalDebit !== totalCredit) {
        return alert(`Jurnal tidak seimbang! Total Debit: ${totalDebit.toLocaleString()}, Total Kredit: ${totalCredit.toLocaleString()}`);
    }
    if (totalDebit === 0) {
        return alert("Jurnal harus memiliki nilai Debit/Kredit!");
    }
    if (editData.entries.some(e => e.id_coa === 0)) {
        return alert("Semua entri harus memiliki Akun COA yang valid.");
    }
    
    try {
      await new AxiosCaller("http://localhost:3001").call["PUT /journals/:id"]({
        headers: { authorization: token },
        paths: { id: editData.id },
        body: {
          date: editData.date,
          description: editData.description,
          lampiran: editData.lampiran,
          referensi: editData.referensi,
          // Kirim hanya data yang relevan ke backend (id_coa, debit, credit, dll.)
          entries: editData.entries.map((e) => ({
            id_coa: e.id_coa,
            code_account: e.code_account,
            account: e.account,
            debit: Number(e.debit),
            credit: Number(e.credit),
          })),
        },
      });
      alert("Jurnal berhasil diperbarui!");
      setEditModalOpen(false);
      await fetchJournals();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui data jurnal! Cek konsol untuk detail.");
    }
  };

  // ================== RENDER ==================
  return (
    <>
      <div className="flex min-h-screen pt-15">
        <Sidebar />
              <div className="flex-1 ">
        <Navbar hideMenu />
        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
              Jurnal Umum
            </h1>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Cari jurnal..."
                className="border border-gray-400 rounded-lg w-64 pl-5 p-2 focus:ring-2 focus:ring-green-400 focus:outline-none placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => router.push("/user/journals/journal-detail")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Lihat Semua Detail
              </button>
            </div>
          </div>

{/* ================== TABEL DATA JURNAL ================== */}
          <div className="overflow-x-auto bg-gradient-to-b from-green-50 to-white rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full text-sm text-black">
              <thead>
                <tr className="bg-black text-green-200 ">
                  <th className="px-6 py-4 text-center border border-green-100">No</th>
                  <th className="px-6 py-4 text-center border border-green-100">Nomor Bukti</th>
                  <th className="px-6 py-4 text-center border border-green-100">Tanggal</th>
                  <th className="px-6 py-4 text-center border border-green-100">Deskripsi</th>
                  <th className="px-6 py-4 text-center border border-green-100">Referensi</th>
                  <th className="px-6 py-4 text-center border border-green-100">Lampiran</th>
                  <th className="px-6 py-4 text-center br-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {journals
                  .filter(
                    (j) =>
                      j.nomor_bukti.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      j.referensi.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((journal, index) => (
                    <tr
                      key={journal.id}
                      className="bg-white hover:bg-green-200/70 border-b-1 border-black transition-all duration-300"
                    >
                      <td className="px-6 py-3 border-r-1 border-gray-200">{index + 1}</td>
                      <td className="px-6 py-3 font-semibold border-r-1 border-gray-200">{journal.nomor_bukti}</td>
                      <td className="px-6 py-3 border-r-1 border-gray-200">{journal.date}</td>
                      <td className="px-6 py-3 border-r-1 border-gray-200">{journal.description}</td>
                      <td className="px-6 py-3 border-r-1 border-gray-200">{journal.referensi}</td>
                      <td className="px-6 py-3 border-r-1 border-gray-200">
                        {journal.lampiran ? (
                          <Link
                            href={journal.lampiran}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            Lihat
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-3 text-center relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(dropdownOpen === journal.id ? null : journal.id)
                          }
                          className="text-green-600 text-xl font-bold"
                        >
                          ⋮
                        </button>

                        {dropdownOpen === journal.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-green-100 rounded-2xl shadow-lg z-10">
                            <button
                              onClick={() => {
                                setSelectedJournal(journal); // <<< Memanggil Modal Detail
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-green-700 hover:bg-green-50 rounded-t-2xl"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleEditClick(journal)}
                              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(journal.id)}
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-2xl"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
                          {/* Jika data masih dimuat */}
          {loading && <p className="text-center mt-4 text-gray-500">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}
        </main>
        </div>
      </div>

      {/* ============ MODAL DETAIL (Lihat Semua Detail) ============ */}
      {selectedJournal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[700px] rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJournal(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-green-700">
              Detail Jurnal #{selectedJournal.nomor_bukti}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
              <p className="col-span-2">
                <strong>Tanggal:</strong> {selectedJournal.date}
              </p>
              <p className="col-span-2">
                <strong>Referensi:</strong> {selectedJournal.referensi}
              </p>
              <p className="col-span-2">
                <strong>Deskripsi:</strong> {selectedJournal.description}
              </p>
              <p className="col-span-2">
                <strong>Lampiran:</strong>{" "}
                {selectedJournal.lampiran ? (
                  <Link href={selectedJournal.lampiran} target="_blank" className="text-blue-600 underline">
                    Lihat File
                  </Link>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <h3 className="font-semibold text-green-700 mb-2">Rincian Entri:</h3>
            <table className="w-full text-sm border border-green-200 rounded-lg">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-2 border">Kode Akun</th>
                  <th className="p-2 border">Nama Akun</th>
                  <th className="p-2 border">Debit</th>
                  <th className="p-2 border">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {selectedJournal.entries.map((e, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{e.code_account}</td>
                    <td className="p-2 border">{e.account}</td>
                    <td className="p-2 border text-right">
                      {e.debit.toLocaleString("id-ID")}
                    </td>
                    <td className="p-2 border text-right">
                      {e.credit.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="font-bold bg-green-50">
                    <td className="p-2 border text-center" colSpan={2}>Total</td>
                    <td className="p-2 border text-right">
                        {selectedJournal.entries.reduce((sum, e) => sum + Number(e.debit), 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-2 border text-right">
                        {selectedJournal.entries.reduce((sum, e) => sum + Number(e.credit), 0).toLocaleString("id-ID")}
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ MODAL EDIT (Full Transaction) ============ */}
      {editModalOpen && editData && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[850px] rounded-2xl shadow-xl p-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-green-700">
              Edit Jurnal #{editData.nomor_bukti}
            </h2>

{/* Form utama edit jurnal */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Tanggal</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Referensi</label>
                <input
                  type="text"
                  value={editData.referensi}
                  onChange={(e) => handleEditChange("referensi", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">Lampiran (URL)</label>
                <input
                  type="text"
                  value={editData.lampiran}
                  onChange={(e) => handleEditChange("lampiran", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
            </div>

            {/* === Entries === */}
            <h3 className="font-semibold text-green-700 mb-2">Rincian Entri</h3>
            <div className="overflow-x-auto">

              {/* Entri akun COA (Debit/Kredit) */}
                <table className="w-full text-sm border border-green-200 rounded-lg mb-4">
                <thead className="bg-green-100">
                    <tr>
                    <th className="p-2 border w-1/2">Akun (COA)</th>
                    <th className="p-2 border w-1/5">Debit</th>
                    <th className="p-2 border w-1/5">Kredit</th>
                    <th className="p-2 border w-1/12"></th>
                    </tr>
                </thead>
                <tbody>
                    {editData.entries.map((entry, index) => (
                    <tr key={index}>
                        <td className="p-2 border">
                        <select
                            value={entry.id_coa}
                            onChange={(e) =>
                            handleEntryChange(index, "id_coa", Number(e.target.value))
                            }
                            className="border rounded p-1 w-full bg-white"
                        >
                            <option value={0}>Pilih Akun</option>
                            {coaList
                            .filter((a) => a.jenis === "detail")
                            .map((coa) => (
                                <option key={coa.id} value={coa.id}>
                                {coa.code_account} - {coa.account}
                                </option>
                            ))}
                        </select>
                        </td>
                        <td className="p-2 border">
                        <input
                            type="number"
                            step="any"
                            value={entry.debit || ""}
                            onChange={(e) =>
                            handleEntryChange(index, "debit", e.target.value)
                            }
                            className="border rounded p-1 w-full text-right"
                        />
                        </td>
                        <td className="p-2 border">
                        <input
                            type="number"
                            step="any"
                            value={entry.credit || ""}
                            onChange={(e) =>
                            handleEntryChange(index, "credit", e.target.value)
                            }
                            className="border rounded p-1 w-full text-right"
                        />
                        </td>
                        <td className="p-2 border text-center">
                            <button 
                                onClick={() => handleRemoveRow(index)}
                                className="text-red-600 hover:text-red-800 font-bold text-lg"
                            >
                                -
                            </button>
                        </td>
                    </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="font-bold bg-green-50">
                        <td className="p-2 border text-center">TOTAL</td>
                        <td className="p-2 border text-right">
                            {editData.entries.reduce((sum, e) => sum + Number(e.debit), 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 border text-right">
                            {editData.entries.reduce((sum, e) => sum + Number(e.credit), 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 border"></td>
                    </tr>
                </tbody>
                </table>
            </div>

{/* Tombol tambah dan simpan */}
            <button
              onClick={handleAddRow}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4 transition"
            >
              + Tambah Baris
            </button>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JournalPage;