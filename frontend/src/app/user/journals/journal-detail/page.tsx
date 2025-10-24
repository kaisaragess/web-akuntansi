"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";

const JournalDetail = () => {

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

    return(
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
                {selectedJournal.lampiran || "-"}
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
    );
}

export default JournalDetail;