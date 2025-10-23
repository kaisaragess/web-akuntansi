"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";

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

interface BukuBesarPerAkun {
  code_account: string;
  account: string;
  entries: {
    tanggal: string;
    nomor_bukti: string;
    deskripsi: string;
    debit: number;
    credit: number;
    saldo: number;
  }[];
}

const BukuBesarPage = () => {
  const [dataBukuBesar, setDataBukuBesar] = useState<BukuBesarPerAkun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

        // ambil data jurnal
        const journalsRes = await axiosClient.call["GET /journals"]({
          headers: { authorization: token },
          query: { limit: 9999 },
        });
        const journals = journalsRes as unknown as Journal[];

        // ambil data COA
        const coaRes = await axiosClient.call["GET /coa"]({
          headers: { authorization: token },
          query: { limit: 9999 },
        });
        const coaList = coaRes as unknown as Coa[];

        // buat map code_account → nama akun
        const coaMap = new Map(coaList.map((c) => [c.code_account, c.account]));

        // flatten semua entries dengan informasi jurnal
        const allEntries = journals.flatMap((j) =>
          j.entries.map((e) => ({
            code_account: e.code_account,
            account: coaMap.get(e.code_account) || "(Tidak ditemukan)",
            tanggal: j.date,
            nomor_bukti: j.nomor_bukti,
            deskripsi: j.description,
            debit: Number(e.debit) || 0,
            credit: Number(e.credit) || 0,
          }))
        );

        // group berdasarkan akun
        const grouped = new Map<string, BukuBesarPerAkun>();

        for (const item of allEntries) {
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
            nomor_bukti: item.nomor_bukti,
            deskripsi: item.deskripsi,
            debit: item.debit,
            credit: item.credit,
            saldo: 0,
          });
        }

        // hitung saldo berjalan per akun
        const finalData: BukuBesarPerAkun[] = [];
        for (const [, akun] of grouped) {
          let saldo = 0;
          akun.entries.sort(
            (a, b) =>
              new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
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
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar hideMenu />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Buku Besar</h1>

        {isLoading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div className="space-y-10">
            {dataBukuBesar.map((akun) => (
              <div
                key={akun.code_account}
                className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="bg-green-300 px-4 py-1 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800">
                    {akun.code_account} - {akun.account}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-800 text-green-200 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Tanggal</th>
                        <th className="px-4 py-2 text-left">No Bukti</th>
                        <th className="px-4 py-2 text-left">Deskripsi</th>
                        <th className="px-4 py-2 text-right">Debit</th>
                        <th className="px-4 py-2 text-right">Credit</th>
                        <th className="px-4 py-2 text-right">Saldo Debit</th>
                        <th className="px-4 py-2 text-right">Saldo Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {akun.entries.map((entry, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2">
                            {new Date(entry.tanggal).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-4 py-2">{entry.nomor_bukti}</td>
                          <td className="px-4 py-2">{entry.deskripsi}</td>
                          <td className="px-4 py-2 text-right">
                            {entry.debit ? entry.debit.toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {entry.credit ? entry.credit.toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-right font-medium text-green-600">
                            {entry.saldo > 0
                              ? entry.saldo.toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-right font-medium text-red-600">
                            {entry.saldo < 0
                              ? Math.abs(entry.saldo).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}

                      {/* 🔽 Total saldo akhir sesuai kolomnya */}
                      <tr className="bg-gray-100 font-semibold border-t">
                        <td colSpan={5} className="px-4 py-2 text-right">
                          Total Saldo
                        </td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {(() => {
                            const saldoAkhir = akun.entries.length
                              ? akun.entries[akun.entries.length - 1].saldo
                              : 0;
                            return saldoAkhir > 0
                              ? saldoAkhir.toLocaleString()
                              : "-";
                          })()}
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {(() => {
                            const saldoAkhir = akun.entries.length
                              ? akun.entries[akun.entries.length - 1].saldo
                              : 0;
                            return saldoAkhir < 0
                              ? Math.abs(saldoAkhir).toLocaleString()
                              : "-";
                          })()}
                        </td>
                      </tr>
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
