"use client";

import Sidebar from "@/app/components/Sidebar/page";
import React, { useState } from "react";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";
import { useRouter } from "next/navigation";



const CoaPage = () => {
    const [isOpen, setIsOpen] = useState(false);
  interface coa {
    id: number
    code_account: string
    account: string
    jenis: string
    description: string
    normal_balance: string
  }

  const router = useRouter();
  const [coa, setCoa] = useState<coa[]>([]);
  const [form, setForm] = useState({
    code_account: "",
    account: "",
    jenis: "",
    description: "",
    normal_balance: ""
  })
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
}

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.account || !form.code_account || !form.description || !form.jenis || !form.normal_balance) {
        setError("Semua field wajib di isi!");
        return;
    }
    setError("");
    setLoading(true);
    try {
        setLoading(true);
        const res = await new AxiosCaller("http://localhost:3001").call["POST /coa"]
        ({
            body: {
                data: {
                    code_account: form.code_account,
                    account: form.account,
                    description: form.description,
                    jenis: form.jenis,
                    normal_balance: form.normal_balance        
                }
            }
        });
        if (res.code_account || res.account || res.jenis || res.description || res.normal_balance) {
            alert("COA Berhasil ditambahkan!");
        } else {
            setError("COA Gagal ditambahkan!");
        }
    } catch (err: any) {
        alert("Gagal, coba cek formnya")
    } finally {
        setLoading(false);
    }
}

  return (
    <>
      <div className="flex">
        <Sidebar />
        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          <h1 className="text-2xl font-bold mb-6 bg-lime-200 p-3 flex items-center justify-center">
            Charts of Accounts (List Akun)
          </h1>
          <div className="grid grid-cols-3 items-start">
            <div>
              <table className="w-xs border-collapse border border-gray-300 shadow-xl">
                <thead>
                  <tr className="bg-black text-lime-300">
                    <th className="p-2">1 AKTIVA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-lime-200">10 AKTIVA LANCAR</th>
                  </tr>
                  <tr>
                    <td>101 Kas</td>
                  </tr>
                  <tr>
                    <th className="bg-lime-200">11 INVESTASI JANGKA PANJANG</th>
                  </tr>
                  <tr>
                    <td>111 Investasi saham</td>
                  </tr>
                  <tr>
                    <th className="bg-lime-200">12 AKTIVA TETAP</th>
                  </tr>
                  <tr>
                    <td>121 Peralatan</td>
                  </tr>
                  <tr>
                    <th className="bg-lime-200">
                      13 AKTIVA TETAP TIDAK BERWUJUD
                    </th>
                  </tr>
                  <tr>
                    <td>131 Hak paten</td>
                  </tr>
                  <tr>
                    <th className="bg-lime-200">14 AKTIVA LAIN-LAIN</th>
                  </tr>
                  <tr>
                    <td>141 Mesin yang tidak digunakan</td>
                  </tr>


                </tbody>
              </table>
            </div>
            <div>
              <table className="w-xs border-collapse border border-gray-300 shadow-xl">
                <thead>
                  <tr className="bg-black text-lime-300">
                    <th className="border border-gray-300 p-2">2 KEWAJIBAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-lime-200">20 KEWAJIBAN </th>
                  </tr>
                  <tr>
                    <td>201 Utang usaha</td>
                  </tr>
                  <tr>
                    <th className="bg-lime-200">21 KEWAJIBAN JANGKA PANJANG</th>
                  </tr>
                  <tr>
                    <td>211 Utang hipotek</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-xs border-collapse border border-gray-300 shadow-xl mt-3">
                <thead>
                  <tr className="bg-black text-lime-300">
                    <th className="border border-gray-300 p-2">3 EKUITAS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-lime-200">30 EKUITAS</th>
                  </tr>
                  <tr>
                    <td>301 Modal/ekuitas pemilik</td>
                  </tr>

                </tbody>
              </table>
              <table className="w-xs border-collapse border border-gray-300 shadow-xl mt-3">
                <thead>
                  <tr className="bg-black text-lime-300">
                    <th className="border border-gray-300 p-2">4 PENDAPATAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-lime-200">40 PENDAPATAN</th>
                  </tr>
                  <tr>
                    <td>401 Pendapatan usaha</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-xs border-collapse border border-gray-300 shadow-xl mt-3">
                <thead>
                  <tr className="bg-black text-lime-300">
                    <th className="border border-gray-300 p-2">5 BEBAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-lime-200">50 BEBAN</th>
                  </tr>
                  <tr>
                    <td>501 Beban gaji toko</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              {/* Tombol tambah akun */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-xs m-4 p-3 bg-lime-600 rounded-xl text-black hover:bg-lime-700 hover:text-white font-bold"
              >
                + add account
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah COA */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 text-black">
          <div className="bg-lime-100 rounded-xl border border-black shadow-lg p-6 w-[400px]">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 rounded text-gray-600 hover:bg-red-600 hover:text-white"
              >
                X
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-2 ">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Code Account
                  </label>
                  <input
                    type="text"
                    value={form.code_account}
                    onChange={(e) =>
                      setForm({ ...form, code_account: e.target.value })
                    }
                    className="border border-black rounded p-2 bg-white"
                    placeholder="Contoh: 101"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Account
                  </label>
                  <input
                    type="text"
                    value={form.account}
                    onChange={(e) =>
                      setForm({ ...form, account: e.target.value })
                    }
                    className="border border-black rounded p-2 bg-white"
                    placeholder="Contoh: Kas"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Jenis
                  </label>
                  <input
                    type="text"
                    value={form.jenis}
                    onChange={(e) =>
                      setForm({ ...form, jenis: e.target.value })
                    }
                    className="border border-black rounded p-2 bg-white"
                    placeholder="Contoh: Debit"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="border border-black rounded p-2 bg-white"
                    placeholder="Contoh: Kas Masuk Baru"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Normal Balance
                  </label>
                  <input
                    type="text"
                    value={form.normal_balance}
                    onChange={(e) =>
                      setForm({ ...form, normal_balance: e.target.value })
                    }
                    className="border border-black rounded p-2 bg-white"
                    placeholder="Contoh: Ini adalah Debit"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 hover:text-white"
                >
                  Simpan
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
