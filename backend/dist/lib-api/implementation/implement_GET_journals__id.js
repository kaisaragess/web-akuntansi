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
exports.implement_GET_journals__id = implement_GET_journals__id;
const verifyToken_1 = require("../../fn/verifyToken"); // Import fungsi untuk verifikasi JWT
const Journal_Entries_1 = require("../model/table/Journal_Entries"); // Import model Journal_Entries dari database
const Journals_1 = require("../model/table/Journals"); // Import model Journals dari database
function implement_GET_journals__id(engine) {
    // Fungsi utama untuk mendaftarkan endpoint GET /journals/:id
    engine.implement({
        endpoint: 'GET /journals/:id', // Menentukan HTTP method dan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // === 1. Ambil token dari header dan lakukan verifikasi ===
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi JWT
                if (!token) { // Jika token tidak valid
                    throw new Error("Unauthorized: Missing token"); // Lempar error 401
                }
                // === 2. Ambil parameter ID jurnal dari path ===
                const { id } = param.paths;
                if (!id) { // Validasi apakah ID diberikan
                    throw new Error("Bad Request: Missing Journal ID"); // Lempar error 400
                }
                try {
                    // === 3. Cari data jurnal berdasarkan ID ===
                    const existingJournal = yield Journals_1.Journals.findOneBy({
                        id: Number(id)
                    });
                    // === 4. Cari semua entri jurnal yang berelasi dengan ID jurnal ===
                    const existingJournal_with_entries = yield Journal_Entries_1.Journal_Entries.find({
                        where: { id_journal: Number(id) }
                    });
                    // === 5. Tambahkan daftar entries ke objek jurnal (opsional casting ke any) ===
                    if (existingJournal) {
                        existingJournal.entries = existingJournal_with_entries;
                    }
                    // === 6. Validasi apakah entries ditemukan ===
                    if (!existingJournal_with_entries) {
                        throw new Error("Not Found: Journal entries do not exist"); // Lempar error 404
                    }
                    // === 7. Validasi apakah jurnal ditemukan ===
                    if (!existingJournal) {
                        throw new Error("Not Found: Journal record does not exist"); // Lempar error 404
                    }
                    // === 8. Bentuk respons sesuai dengan tipe JournalRes ===
                    return {
                        id: existingJournal.id,
                        id_user: existingJournal.id_user,
                        nomor_bukti: existingJournal.nomor_bukti,
                        date: existingJournal.date.toISOString(),
                        description: existingJournal.description,
                        lampiran: existingJournal.lampiran,
                        referensi: existingJournal.referensi,
                        entries: existingJournal_with_entries.map(entry => ({
                            id: entry.id,
                            id_journal: entry.id_journal,
                            id_coa: entry.id_coa,
                            code_account: entry.otm_id_journal ? entry.otm_id_journal.code_account : '',
                            debit: entry.debit,
                            credit: entry.credit
                        }))
                    };
                }
                catch (error) {
                    // === 9. Tangani error dan kembalikan pesan deskriptif ===
                    throw new Error('Gagal mendapatkan detail jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
