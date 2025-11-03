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
exports.implement_GET_journals = implement_GET_journals;
const verifyToken_1 = require("../../fn/verifyToken"); // Import fungsi verifikasi JWT
const Journals_1 = require("../model/table/Journals"); // Import model Journals dari database
const Journal_Entries_1 = require("../model/table/Journal_Entries"); // Import model Journal_Entries
const Coa_1 = require("../model/table/Coa"); // Import model Coa untuk ambil kode akun
function implement_GET_journals(engine) {
    // Fungsi utama untuk mendaftarkan endpoint GET /journals
    engine.implement({
        endpoint: 'GET /journals', // Menentukan HTTP method dan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // === 1. Verifikasi Token ===
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi JWT token
                if (!token) { // Jika token tidak valid
                    throw new Error("Unauthorized: Invalid token or missing user ID"); // Lempar error 401
                }
                // === 2. Ambil parameter pagination dari query ===
                const { limit, page } = param.query;
                // === 3. Hitung jumlah data per halaman dan offset untuk pagination ===
                const take = limit ? parseInt(limit, 10) : 10;
                const parsedPage = page ? parseInt(page, 10) : 1;
                const skip = (parsedPage - 1) * take;
                try {
                    // === 4. Ambil daftar jurnal dari database dengan urutan tanggal terbaru ===
                    const JournalsRecords = yield Journals_1.Journals.find({
                        where: {},
                        take,
                        skip,
                        order: { date: 'DESC' }
                    });
                    // Array hasil akhir yang akan dikembalikan
                    const result = [];
                    // === 5. Iterasi setiap jurnal untuk mengambil entri terkait ===
                    for (const journal of JournalsRecords) {
                        const entries = yield Journal_Entries_1.Journal_Entries.find({
                            where: { id_journal: journal.id },
                            relations: { "otm_id_journal": true } // Ambil relasi CoA (opsional)
                        });
                        // === 6. Format setiap entry agar menampilkan kode akun (CoA) ===
                        const formattedEntries = yield Promise.all(entries.map((entry) => __awaiter(this, void 0, void 0, function* () {
                            const coa = yield Coa_1.Coa.findOne({ where: { id: entry.id_coa } });
                            return {
                                id_coa: entry.id_coa,
                                code_account: coa ? coa.code_account : "",
                                debit: entry.debit,
                                credit: entry.credit,
                            };
                        })));
                        // === 7. Susun objek jurnal lengkap dengan entries terformat ===
                        result.push({
                            id: journal.id,
                            id_user: journal.id_user,
                            date: journal.date.toISOString().split('T')[0],
                            description: journal.description || '',
                            referensi: journal.referensi || '',
                            lampiran: journal.lampiran || '',
                            nomor_bukti: journal.nomor_bukti || '',
                            entries: formattedEntries
                        });
                    }
                    // === 8. Kembalikan seluruh daftar jurnal ===
                    return result;
                }
                catch (error) {
                    // === 9. Tangani error dengan detail pesan tambahan ===
                    throw new Error('Gagal mengambil daftar jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
