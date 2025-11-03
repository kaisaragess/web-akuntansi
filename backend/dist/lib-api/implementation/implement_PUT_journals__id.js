"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implement_PUT_journals__id = implement_PUT_journals__id;
const verifyToken_1 = require("../../fn/verifyToken"); // Import fungsi verifyToken untuk validasi JWT
const Journal_Entries_1 = require("../model/table/Journal_Entries"); // Import model Journal_Entries dari database
const Journals_1 = require("../model/table/Journals"); // Import model Journals dari database
function implement_PUT_journals__id(engine) {
    // Fungsi untuk implementasi endpoint PUT /journals/:id
    engine.implement({
        endpoint: 'PUT /journals/:id', // Menentukan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers; // Ambil header authorization
                const token = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi token JWT
                if (!token) { // Jika token tidak valid atau tidak ada
                    throw new Error("Unauthorized: Missing token"); // Lempar error
                }
                const id = Number(param.paths.id); // Ambil ID jurnal dari path parameter dan konversi ke number
                if (isNaN(id) || id <= 0) { // Validasi format ID
                    throw new Error("Bad Request: Invalid Journal ID format"); // Lempar error jika invalid
                }
                const journal = yield Journals_1.Journals.findOne({ where: { id } }); // Cari jurnal berdasarkan ID
                if (!journal) { // Jika jurnal tidak ditemukan
                    throw new Error("Jurnal tidak ditemukan"); // Lempar error
                }
                const { date, entries, description, lampiran, referensi } = param.body; // Ambil data dari request body
                if (!date || !entries) { // Validasi date dan entries
                    throw new Error("Bad Request: nomor_bukti, date, and entries are required"); // Lempar error jika kosong
                }
                journal.date = new Date(date); // Update tanggal jurnal
                journal.description = description || ""; // Update deskripsi atau kosong jika tidak ada
                journal.lampiran = lampiran || ""; // Update lampiran atau kosong jika tidak ada
                journal.referensi = referensi || ""; // Update referensi atau kosong jika tidak ada
                yield journal.save(); // Simpan perubahan jurnal
                yield Journal_Entries_1.Journal_Entries.delete({ id_journal: journal.id }); // Hapus semua entries lama jurnal
                for (const entry of entries) { // Loop setiap entry baru
                    const newEntry = new Journal_Entries_1.Journal_Entries(); // Buat instance Journal_Entries baru
                    newEntry.id_journal = journal.id; // Set ID jurnal
                    newEntry.id_coa = entry.id_coa; // Set ID COA
                    newEntry.debit = entry.debit; // Set debit
                    newEntry.credit = entry.credit; // Set credit
                    yield newEntry.save(); // Simpan entry baru ke database
                }
                // 🔁 Ambil ulang jurnal beserta entries
                const updatedEntries = yield Journal_Entries_1.Journal_Entries.find({ where: { id_journal: journal.id } });
                const result = {
                    id: journal.id, // ID jurnal
                    id_user: journal.id_user, // ID user pemilik jurnal
                    nomor_bukti: journal.nomor_bukti, // Nomor bukti jurnal
                    date: date, // Tanggal jurnal
                    description: journal.description, // Deskripsi jurnal
                    lampiran: journal.lampiran, // Lampiran jurnal
                    referensi: journal.referensi, // Referensi jurnal
                    entries: entries // Entries jurnal yang baru
                };
                return result; // Kembalikan data jurnal yang telah diperbarui
            });
        }
    });
}
