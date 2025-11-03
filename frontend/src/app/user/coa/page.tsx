"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import AuthGuard from "@/app/components/AuthGuard/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";

/**
 * ============================================================
 * 📘 Komponen: CoaPage (Charts of Account)
 * ============================================================
 * Komponen ini berfungsi sebagai halaman utama untuk mengelola
 * daftar akun (Chart of Accounts) dalam sistem akuntansi pengguna.
 * 
 * Fitur-fitur utama:
 *  - Menampilkan daftar akun yang diambil dari API
 *  - Menambahkan, mengedit, dan menghapus data akun
 *  - Fitur pencarian akun berdasarkan kode atau nama
 *  - Menampilkan detail akun lewat pop-up
 *  - Tampilan modern dengan gaya dashboard hijau lembut
 */

const CoaPage = () => {
  // ========================= INTERFACE =========================
  /**
   * Interface Coa digunakan untuk mendefinisikan struktur data akun.
   */
  interface Coa {
    id: number;
    code_account: string;
    account: string;
    jenis: string;
    description: string;
    normal_balance: string;
  }

  // ========================= STATE =========================
  /**
   * - coaList: Menyimpan daftar akun dari server
   * - isOpen: Mengontrol tampilan modal tambah/edit akun
   * - loading: Status pemuatan data
   * - error: Menyimpan pesan error validasi
   * - searchTerm: Nilai input pencarian
   * - dropdownOpen: Menentukan ID dropdown aksi yang terbuka
   * - selectedCoa: Menyimpan akun yang dipilih untuk detail
   * - form: Menyimpan data form tambah/edit akun
   * - editId: Menandakan apakah sedang dalam mode edit
   */
  const [coaList, setCoaList] = useState<Coa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [selectedCoa, setSelectedCoa] = useState<Coa | null>(null);
  const [form, setForm] = useState({
    code_account: "",
    account: "",
    jenis: "",
    description: "",
    normal_balance: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  const router = useRouter();

  // ========================= FETCH DATA =========================
  /**
   * mengambil daftar akun dari API
   */
  const fetchCoa = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);
      const res = await new AxiosCaller("http://localhost:3001").call[
        "GET /coa"
      ]({
        headers: { authorization: token },
        query: {limit: 9999},
      });

      // ✅ Urutkan berdasarkan code_account (numerik)
      const sortedData = [...res].sort((a, b) => {
        return parseInt(a.code_account) - parseInt(b.code_account);
      });

      setCoaList(sortedData);
    } catch (err) {
      console.error("Gagal ambil data COA:", err);
      alert("Gagal memuat data COA");
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchCoa saat halaman pertama kali dimuat
  useEffect(() => {
    fetchCoa();
  }, []);

  // ========================= HANDLE FORM =========================
  /**
   * Fungsi untuk memperbarui nilai form ketika pengguna mengetik.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ========================= SUBMIT (POST / PUT) =========================
  /**
   * Fungsi untuk mengirim data form.
   * - Jika editId ada → mode Edit (PUT)
   * - Jika tidak → mode Tambah (POST)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    if (
      !form.code_account ||
      !form.account ||
      !form.description ||
      !form.jenis ||
      !form.normal_balance
    ) {
      setError("Semua field wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        await new AxiosCaller("http://localhost:3001").call["PUT /coa/:id"]({
          headers: { authorization: token },
          paths: { id: editId },
          body: { data: form },
        });
        alert("Akun berhasil diedit!");
      } else {
        await new AxiosCaller("http://localhost:3001").call["POST /coa"]({
          headers: { authorization: token },
          body: { data: form },
        });
        alert("Akun berhasil ditambahkan!");
      }

      setIsOpen(false);
      setEditId(null);
      await fetchCoa();
      setForm({
        code_account: "",
        account: "",
        jenis: "",
        description: "",
        normal_balance: "",
      });
    } catch (err) {
      console.error("Error:", err);
      alert(
        editId ? "Gagal mengedit akun!" : "Gagal membuat akun, coba cek lagi!"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================= DELETE =========================
  /**
   * Fungsi untuk menghapus data akun berdasarkan ID.
   * Akan muncul konfirmasi terlebih dahulu sebelum menghapus.
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Token tidak ditemukan. Silakan login ulang.");

    try {
      await new AxiosCaller("http://localhost:3001").call["DELETE /coa/:id"]({
        headers: { authorization: token },
        paths: { id },
      });

      alert("Akun berhasil dihapus!");
      await fetchCoa();
    } catch (err) {
      console.error("Gagal menghapus akun:", err);
      alert("Gagal menghapus akun!");
    }
  };

  // ========================= BUKA EDIT =========================
  /**
   * Fungsi untuk menampilkan data akun ke dalam form edit.
   */
  const handleEdit = (coa: Coa) => {
    setForm({
      code_account: coa.code_account,
      account: coa.account,
      jenis: coa.jenis,
      description: coa.description,
      normal_balance: coa.normal_balance,
    });
    setEditId(coa.id);
    setIsOpen(true);
    setDropdownOpen(null);
  };

  // ========================= RENDER =========================
  /**
   * Menampilkan tampilan utama halaman COA:
   * - Navbar dan Sidebar
   * - Tabel data COA
   * - Modal detail akun
   * - Modal tambah/edit akun
   */
  return (
    <AuthGuard>
    <>
      <div className="flex min-h-screen pt-15">
      <Sidebar />
      <div className="flex-1 ">
        <Navbar hideMenu/>
        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          {/* Navbar di atas */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            {/* === Judul Halaman === */}
            <h1 className="text-2xl font-bold bg-green-200 px-6 py-2 rounded-md shadow-sm">
              Charts of Account
            </h1>

            {/* === Search Bar + Tombol Add === */}
            <div className="flex items-center gap-3">
              {/* 🔍 Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Account..."
                  className="border border-gray-400 rounded-lg w-64 pl-5 p-2 focus:ring-2 focus:ring-green-400 focus:outline-none placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* ➕ Tombol Add */}
              <button
                onClick={() => {
                  setForm({
                    code_account: "",
                    account: "",
                    jenis: "",
                    description: "",
                    normal_balance: "",
                  });
                  setEditId(null);
                  setIsOpen(true);
                }}
                className="text-sm px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition font-semibold shadow-md"
              >
                + Add Account
              </button>
            </div>
          </div>

          {/* === TABEL UTAMA (Modern Soft Green Dashboard Style) === */}
          <div className="overflow-x-auto overflow-visible relative bg-gradient-to-b from-green-50 to-white rounded-xl shadow-lg border border-green-100">
            <table className="min-w-full text-sm text-black rounded-xl relative z-0">
              <thead>
                <tr className="bg-stone-900 border-b border-green-200 text-white">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Kode Akun
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Nama Akun
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {coaList
                  .filter(
                    (item) =>
                      item.code_account
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      item.account
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((coa, index) => {
                    let rowColor = "";

                    // Warna baris berdasarkan jenis
                    switch (coa.jenis) {
                      case "category":
                        rowColor = "bg-green-300 hover:bg-lime-200/70";
                        break;
                      case "sub-category":
                        rowColor = "bg-green-200 hover:bg-lime-200/70";
                        break;
                      case "detail":
                        rowColor = "bg-green-100 hover:bg-lime-200/70";
                        break;
                      default:
                        rowColor = "bg-green-100 hover:bg-green-200/70";
                    }

                    return (
                      <tr
                        key={coa.id}
                        className={`${rowColor} border-b border-green-200 transition-all duration-300}`}
                        >
                        <td className="px-6 py-3 font-semibold text-gray-700">
                          {index + 1}
                        </td>
                        <td className="px-6 py-3 font-semibold text-black">
                          {coa.code_account}
                        </td>
                        <td className="px-6 py-3">{coa.account}</td>
                        <td className="px-6 py-3 text-start">
                          <button
                            onClick={() => setSelectedCoa(coa)}
                            className="px-3 py-1 border border-gray-400 bg-green-200 hover:bg-green-700 hover:text-white text-black text-xs font-semibold rounded-full shadow transition-all"
                          >
                            {coa.jenis.replace("-", " ")}
                          </button>
                        </td>

                        <td className="px-6 py-3 text-center relative">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === coa.id ? null : coa.id
                              )
                            }
                            className="text-green-400 hover:text-green-900 transition text-xl font-bold"
                          >
                            ⋮
                          </button>

                          {dropdownOpen === coa.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-green-100 rounded-2xl shadow-lg z-10 animate-fadeIn">
                              <button
                                onClick={() => handleEdit(coa)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-t-2xl transition"
                              >
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(coa.id)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl transition"
                              >
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </main>

      </div>
      </div>

      {/* ====== POPUP DETAIL COA ====== */}
      {selectedCoa && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[400px] text-black animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-green-700">Detail Akun</h2>
              <button
                onClick={() => setSelectedCoa(null)}
                className="text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Kode Akun:</span>{" "}
                {selectedCoa.code_account}
              </p>
              <p>
                <span className="font-semibold">Nama Akun:</span>{" "}
                {selectedCoa.account}
              </p>
              <p>
                <span className="font-semibold">Jenis:</span>{" "}
                {selectedCoa.jenis}
              </p>
              <p>
                <span className="font-semibold">Normal Balance:</span>{" "}
                {selectedCoa.normal_balance}
              </p>
              {/* <p>
                <span className="font-semibold">Deskripsi:</span>{" "}
                {selectedCoa.description || "-"}
              </p> */}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedCoa(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL TAMBAH / EDIT ====== */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 text-black z-50">
          <div className="bg-green-100 rounded-xl border border-black shadow-lg p-6 w-[400px]">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setEditId(null);
                }}
                className="px-2.5 py-1 rounded text-gray-600 hover:bg-red-600 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Code Account
                </label>
                <input
                  name="code_account"
                  value={form.code_account}
                  onChange={handleChange}
                  className="border border-black rounded p-2 w-full bg-white"
                  placeholder="Contoh: 101"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Account
                </label>
                <input
                  name="account"
                  value={form.account}
                  onChange={handleChange}
                  className="border border-black rounded p-2 w-full bg-white"
                  placeholder="Contoh: Kas"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Jenis
                </label>
                <select
                  name="jenis"
                  value={form.jenis}
                  onChange={handleChange}
                  className="border border-black rounded p-2 w-full bg-white"
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="category">Category</option>
                  <option value="sub-category">Sub Category</option>
                  <option value="detail">Detail</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Description
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="border border-black rounded p-2 w-full bg-white"
                  placeholder="Contoh: Kas Masuk Baru"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Normal Balance
                </label>
                <select
                  name="normal_balance"
                  value={form.normal_balance}
                  onChange={handleChange}
                  className="border border-black rounded p-2 w-full bg-white"
                >
                  <option value="">-- Pilih Normal Balance --</option>
                  <option value="debit">Debit</option>
                  <option value="kredit">Kredit</option>
                </select>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${
                    editId
                      ? "bg-blue-500 hover:bg-blue-700"
                      : "bg-green-500 hover:bg-green-700"
                  } text-white font-bold`}
                >
                  {editId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  </AuthGuard>
  );
};

export default CoaPage;