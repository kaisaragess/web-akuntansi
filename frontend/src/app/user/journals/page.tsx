"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import Link from "next/link";

const JournalPage = () => {
  interface Entry {
    id_coa: number;
    code_account: string;
    account: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editJournal, setEditJournal] = useState<Journal | null>(null);

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

      const journalRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /journals"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      const coaRes = await new AxiosCaller("http://localhost:3001").call[
        "GET /coa"
      ]({
        headers: { authorization: token },
        query: { limit: 9999 },
      });

      const coaMap = new Map<
        number,
        { account: string; code_account: string }
      >();
      coaRes.forEach((c: any) => {
        coaMap.set(c.id, { account: c.account, code_account: c.code_account });
      });

      const merged = (journalRes as any[]).map((journal) => ({
        ...journal,
        entries: journal.entries.map((entry: any) => ({
          ...entry,
          account: coaMap.get(entry.id_coa)?.account || "-",
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

  useEffect(() => {
    fetchJournals();
  }, []);

  // ========================= EDIT & DELETE =========================
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

  const handleEdit = async (journal: Journal) => {
    const anyJournal = journal as any;
    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    try {
      await new AxiosCaller("http://localhost:3001").call["PUT /journals/:id"]({
        headers: { authorization: token },
        paths: { id: journal.id },
        body: {
          date: journal.date,
          nomor_bukti: journal.nomor_bukti,
          description: journal.description,
          lampiran: journal.lampiran,
          referensi: journal.referensi,
          entries: anyJournal.entries || [],
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

  // ========================= RENDER =========================
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

              {/* 🔹 Tombol menuju halaman journal-detail */}
              <button
                onClick={() => router.push("/user/journals/journal-detail")}
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
                              onClick={() => handleOpenEdit(journal)}
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
    </>
  );
};

export default JournalPage;
