"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";

const CoaPage = () => {
  interface Coa {
    id: number;
    code_account: string;
    account: string;
    jenis: string;
    description: string;
    normal_balance: string;
  }

  const [coaList, setCoaList] = useState<Coa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code_account: "",
    account: "",
    jenis: "",
    description: "",
    normal_balance: "",
  });

  const [editId, setEditId] = useState<number | null>(null); // 👈 Tambahan untuk mode edit
  const router = useRouter();

  // ========================= FETCH DATA =========================
  const fetchCoa = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);
      const res = await new AxiosCaller("http://localhost:3001").call["GET /coa"]({
        headers: { authorization: token },
        query: {},
      });
      setCoaList(res);
    } catch (err) {
      console.error("Gagal ambil data COA:", err);
      alert("Gagal memuat data COA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoa();
  }, []);

  // ========================= HANDLE FORM =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ========================= SUBMIT (POST / PUT) =========================
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
        // 👈 Kalau sedang edit
        await new AxiosCaller("http://localhost:3001").call["PUT /coa/:id"]({
          headers: { authorization: token },
          paths: { id: editId },
          body: { data: form },
        });
        alert("Akun berhasil diedit!");
      } else {
        // 👈 Kalau tambah baru
        await new AxiosCaller("http://localhost:3001").call["POST /coa"]({
          headers: { authorization: token },
          body: { data: form },
        });
        alert("Akun berhasil ditambahkan!");
      }

      setIsOpen(false);
      setEditId(null); // reset mode edit
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
      alert(editId ? "Gagal mengedit akun!" : "Gagal membuat akun, coba cek lagi!");
    } finally {
      setLoading(false);
    }
  };

  // ========================= DELETE =========================
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

  // ========================= BUKA MODAL EDIT =========================
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
  };

  // ========================= RENDER =========================
  return (
    <>
      <div className="flex">
        <Sidebar />

        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-green-200 px-4 py-2 rounded">
              Charts of Accounts
            </h1>

            <div className="flex gap-2">
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
                className="text-sm px-4 py-3 bg-green-500 rounded-xl text-white hover:bg-green-700 font-bold"
              >
                + Add Account
              </button>
            </div>
          </div>

          {/* === GRID DENGAN JEDA ANTAR TABEL === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {coaList
              .filter((item) => item.jenis === "category")
              .map((kategori) => (
                <div
                  key={kategori.code_account}
                  className="overflow-hidden rounded-xl min-w-[300px] bg-white border border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-green-300 relative text-xm">
                        <th className="p-2 text-center relative">
                          {kategori.code_account} {kategori.account}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                            <button
                              onClick={() => handleEdit(kategori)}
                              className="text-gray-400 hover:text-blue-600 text-lg font-bold transition-transform hover:scale-110"
                              title="Edit akun"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDelete(kategori.id)}
                              className="text-gray-400 hover:text-red-600 text-lg font-bold transition-transform hover:scale-110"
                              title="Hapus akun"
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-green-200 font-semibold text-xs">
                      {coaList
                        .filter(
                          (sub) =>
                            sub.jenis === "sub-category" &&
                            sub.code_account.startsWith(kategori.code_account)
                        )
                        .map((subKategori) => (
                          <React.Fragment key={subKategori.code_account}>
                            <tr className="bg-green-300 text-center relative">
                              <td className="p-2 relative">
                                {subKategori.code_account} {subKategori.account}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                  <button
                                    onClick={() => handleEdit(subKategori)}
                                    className="text-gray-600 hover:text-blue-600 text-sm font-bold transition-transform hover:scale-110"
                                    title="Edit akun"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    onClick={() => handleDelete(subKategori.id)}
                                    className="text-gray-600 hover:text-red-700 text-sm font-bold transition-transform hover:scale-110"
                                    title="Hapus akun"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* === DETAIL === */}
                            {coaList
                              .filter(
                                (detail) =>
                                  detail.jenis === "detail" &&
                                  detail.code_account.startsWith(subKategori.code_account)
                              )
                              .map((detail) => (
                                <tr
                                  key={detail.code_account}
                                  className="hover:bg-green-100 transition"
                                >
                                  <td className="flex justify-between items-center pl-6 pr-3 py-1 relative">
                                    <span>
                                      {detail.code_account} {detail.account}
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEdit(detail)}
                                        className="text-gray-600 hover:text-blue-600 text-sm font-bold transition-transform hover:scale-110"
                                        title="Edit akun"
                                      >
                                        ✎
                                      </button>
                                      <button
                                        onClick={() => handleDelete(detail.id)}
                                        className="text-gray-600 hover:text-red-700 text-sm font-bold transition-transform hover:scale-110"
                                        title="Hapus akun"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </React.Fragment>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        </main>
      </div>

      {/* ====== MODAL TAMBAH / EDIT ====== */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 text-black z-50">
          <div className="bg-green-100 rounded-xl border border-black shadow-lg p-6 w-[400px]">
            {/* Tombol Tutup */}
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

            {/* Form Tambah / Edit */}
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
                <label className="text-sm font-semibold mb-1 block">Jenis</label>
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
                    editId ? "bg-blue-500 hover:bg-blue-700" : "bg-green-500 hover:bg-green-700"
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
  );
};

export default CoaPage;
