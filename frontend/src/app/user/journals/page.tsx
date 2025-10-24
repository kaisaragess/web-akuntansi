"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import { JournalRes } from "../../../../axios-client/ts-schema/JournalRes";
import { Entry } from "../../../../axios-client/ts-schema/Entry";
import { Journal_Entries } from "../../../../axios-client/ts-model/table/Journal_Entries";
import Link from "next/link";

const JournalPage = () => {
  interface Entry {
    id_coa: number;
    code_account: string;
    account: string; // ✅ tambahkan ini
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

  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const router = useRouter();

  // ========================= FETCH DATA =========================
  const fetchJournals = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);

      // Ambil semua journal
      const journalRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /journals"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      // Ambil semua COA (akun)
      const coaRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /coa"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      // Buat map id_coa -> nama akun
      const coaMap = new Map<
        number,
        { account: string; code_account: string }
      >();
      coaRes.forEach((c: any) => {
        coaMap.set(c.id, { account: c.account, code_account: c.code_account });
      });

      // Gabungkan data COA ke entries
      const merged = (journalRes as any[]).map((journal) => ({
        ...journal,
        entries: journal.entries.map((entry: any) => ({
          ...entry,
          account: coaMap.get(entry.id_coa)?.account || "-", // ambil nama akun dari COA
          code_account:
            coaMap.get(entry.id_coa)?.code_account || entry.code_account,
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


const handleOpenEdit = (journal: Journal) => {
  setEditJournal(journal);
  setShowEditModal(true);
  setDropdownOpen(null);
};

const handleSaveEdit = async () => {
  if (!editJournal) return;
  await handleEdit(editJournal);
  setShowEditModal(false);
};


  // alert(`Edit jurnal #${journal.nomor_bukti}`);
  // setDropdownOpen(null);

  const [editJournal, setEditJournal] = useState<Journal | null>(null);

const handleEdit = async (journal: Journal) => {
  const anyJournal = journal as any; // ✅ tambahan biar gak merah
  const token = localStorage.getItem("token");
  if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

  try {
    const res = await new AxiosCaller("http://localhost:3001").call[
      "PUT /journals/:id"
    ]({
      headers: { authorization: token },
      paths: { id: journal.id },
      body: {
        date: journal.date,
        nomor_bukti: journal.nomor_bukti,
        description: journal.description,
        lampiran: journal.lampiran,
        referensi: journal.referensi,
        entries: anyJournal.entries || [], // ✅ aman, gak merah lagi
      },
    });

    alert("Jurnal berhasil diperbarui!");
    setEditJournal(null);
    await fetchJournals();
  } catch (err) {
    console.error("Gagal update jurnal:", err);
    alert("Gagal memperbarui jurnal!");
  }
};


  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    try {
      await new AxiosCaller("http://localhost:3001").call[
        "DELETE /journals/:id"
      ]({
        headers: { authorization: token },
        paths: { id },
      });
      alert("Jurnal berhasil dihapus!");
      await fetchJournals();
    } catch (err) {
      console.error("Gagal menghapus jurnal:", err);
      alert("Gagal menghapus jurnal!");
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <>
      <div className="flex min-h-screen pt-14">
        <Sidebar />
        <Navbar hideMenu />
        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black ">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
              Journals
            </h1>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Cari jurnal..."
                className="border border-gray-400 rounded-lg w-64 pl-5 p-2 focus:ring-2 focus:ring-green-400 focus:outline-none placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* ✅ Tombol modal semua entries */}
              <button
                onClick={() => setShowAllEntries(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Lihat Semua Detail
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-visible relative bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-lg border border-green-100">
            <table className="min-w-full text-sm text-black rounded-xl relative z-0">
              <thead>
                <tr className="bg-stone-900 border-b border-green-200 text-white">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Nomor Bukti
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Referensi
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {journals
                  .filter(
                    (j) =>
                      j.nomor_bukti
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      j.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      j.referensi
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((journal, index) => (
                    <tr
                      key={journal.id}
                      className="bg-green-100 hover:bg-green-200/70 border-b border-green-200 transition-all duration-300"
                    >
                      <td className="px-6 py-3 font-semibold text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-6 py-3 font-semibold text-black">
                        {journal.nomor_bukti}
                      </td>
                      <td className="px-6 py-3">{journal.date}</td>
                      <td className="px-6 py-3 truncate max-w-[200px]">
                        {journal.description || "-"}
                      </td>
                      <td className="px-6 py-3">{journal.referensi || "-"}</td>
                      <td className="px-6 py-3 text-center relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === journal.id ? null : journal.id
                            )
                          }
                          className="text-green-500 hover:text-green-900 text-xl font-bold transition"
                        >
                          ⋮
                        </button>

                        {dropdownOpen === journal.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-green-100 rounded-2xl shadow-lg z-10 animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedJournal(journal);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-t-2xl transition"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => {
                                handleOpenEdit(journal);
                              }}
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(journal.id)}
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl transition"
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

          {loading && (
            <p className="text-center text-gray-500 mt-4">Memuat data...</p>
          )}
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        </main>
      </div>

      {/* ====== POPUP DETAIL JOURNAL ====== */}
      {selectedJournal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[600px] text-black animate-fadeIn max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-green-700">
                Detail Jurnal #{selectedJournal.id}
              </h2>
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Nomor Bukti:</span>{" "}
                {selectedJournal.nomor_bukti}
              </p>
              <p>
                <span className="font-semibold">Tanggal:</span>{" "}
                {selectedJournal.date}
              </p>
              <p>
                <span className="font-semibold">Deskripsi:</span>{" "}
                {selectedJournal.description || "-"}
              </p>
              <p>
                <span className="font-semibold">Referensi:</span>{" "}
                {selectedJournal.referensi || "-"}
              </p>
              <p>
                <span className="font-semibold">Lampiran:</span>{" "}
                  <Link className="text-blue-400 hover:text-blue-700" href={selectedJournal.lampiran || "-"}>{selectedJournal.lampiran || "-"}</Link>
              </p>
            </div>

            {/* ✅ Tabel detail entri akun */}
            <div className="mt-4">
              <h3 className="font-semibold text-green-600 mb-2">
                Detail Entri Akun:
              </h3>
              <table className="min-w-full text-sm border border-green-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-green-200 text-left">
                    <th className="px-4 py-2">Kode Akun</th>
                    <th className="px-4 py-2">Account</th>
                    <th className="px-4 py-2">Debit</th>
                    <th className="px-4 py-2">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedJournal.entries.map((entry, i) => (
                    <tr key={i} className="border-t border-green-100">
                      <td className="px-4 py-2">{entry.code_account}</td>
                      <td className="px-4 py-2">{entry.account}</td>
                      <td className="px-4 py-2 text-green-600 font-semibold">
                        {entry.debit}
                      </td>
                      <td className="px-4 py-2 text-red-600 font-semibold">
                        {entry.credit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ✅ POPUP SEMUA ENTRIES */}
      {/* ✅ Popup Semua Entries — Dikelompokkan per transaksi dan tanggal */}
      {showAllEntries && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[900px] text-black animate-fadeIn max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-green-700 items-center justify-center">
                Semua Detail Entri Jurnal
              </h2>
              <button
                onClick={() => setShowAllEntries(false)}
                className="text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* ✅ Satu tabel untuk semua entri, per transaksi hanya satu tanggal & nomor bukti */}
            <table className="min-w-full text-sm border border-green-200 rounded-xl overflow-hidden">
              <thead className="bg-green-200 text-left">
                <tr>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Kode Akun</th>
                  <th className="px-4 py-2">Account</th>
                  <th className="px-4 py-2">Debit</th>
                  <th className="px-4 py-2">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((journal, jIndex) => (
                  <React.Fragment key={jIndex}>
                    {journal.entries.map((entry, i) => (
                      <tr
                        key={`${journal.id}-${i}`}
                        className="border-t border-green-100 hover:bg-green-50"
                      >
                        {/* ✅ Tampilkan tanggal & nomor bukti hanya di baris pertama transaksi */}
                        {i === 0 ? (
                          <>
                            <td
                              rowSpan={journal.entries.length}
                              className="px-4 py-2 align-top font-medium"
                            >
                              {journal.date}
                            </td>
                          </>
                        ) : null}

                        <td className="px-4 py-2">{entry.code_account}</td>
                        <td className="px-4 py-2">{entry.account}</td>
                        <td className="px-4 py-2 text-green-600 font-semibold">
                          {entry.debit}
                        </td>
                        <td className="px-4 py-2 text-red-600 font-semibold">
                          {entry.credit}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
      {/* ✅ POPUP EDIT JOURNAL */}
{showEditModal && editJournal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-[700px] text-black animate-fadeIn max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-blue-700">
          Edit Jurnal #{editJournal.nomor_bukti}
        </h2>
        <button
          onClick={() => setShowEditModal(false)}
          className="text-gray-500 hover:text-red-600 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* ===================== FIELD DASAR ===================== */}
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <input
            type="date"
            value={editJournal.date}
            onChange={(e) =>
              setEditJournal({ ...editJournal, date: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            value={editJournal.description}
            onChange={(e) =>
              setEditJournal({ ...editJournal, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Referensi</label>
          <input
            type="text"
            value={editJournal.referensi}
            onChange={(e) =>
              setEditJournal({ ...editJournal, referensi: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lampiran</label>
          <input
            type="text"
            value={editJournal.lampiran}
            onChange={(e) =>
              setEditJournal({ ...editJournal, lampiran: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* ===================== EDIT DEBIT / CREDIT ===================== */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-blue-700">
            Edit Nilai Debit & Kredit
          </h3>
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-100 text-left">
              <tr>
                <th className="px-3 py-2">Kode Akun</th>
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Debit</th>
                <th className="px-3 py-2">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {editJournal.entries.map((entry, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{entry.code_account}</td>
                  <td className="px-3 py-2">{entry.account}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={entry.debit}
                      onChange={(e) => {
                        const updated = [...editJournal.entries];
                        updated[i] = { ...updated[i], debit: e.target.value };
                        setEditJournal({ ...editJournal, entries: updated });
                      }}
                      className="w-full border border-gray-300 rounded-lg p-1 text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={entry.credit}
                      onChange={(e) => {
                        const updated = [...editJournal.entries];
                        updated[i] = { ...updated[i], credit: e.target.value };
                        setEditJournal({ ...editJournal, entries: updated });
                      }}
                      className="w-full border border-gray-300 rounded-lg p-1 text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== BUTTON ACTION ===================== */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Batal
        </button>
        <button
          onClick={handleSaveEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
