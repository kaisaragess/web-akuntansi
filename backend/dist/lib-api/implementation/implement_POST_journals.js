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
exports.implement_POST_journals = implement_POST_journals;
// Import modul TypeORM untuk operator query In dan Between
const typeorm_1 = require("typeorm");
// Import data source utama untuk transaksi database
const data_source_1 = require("../../data-source");
// Import fungsi verifikasi JWT token
const verifyToken_1 = require("../../fn/verifyToken");
// Import model Coa (Chart of Accounts)
const Coa_1 = require("../model/table/Coa");
// Import model Journal_Entries (entri jurnal)
const Journal_Entries_1 = require("../model/table/Journal_Entries");
// Import model Journals (tabel utama jurnal)
const Journals_1 = require("../model/table/Journals");
// Fungsi utama implementasi endpoint POST /journals
function implement_POST_journals(engine) {
    engine.implement({
        // Tentukan endpoint HTTP
        endpoint: "POST /journals",
        // Fungsi handler async yang menerima request dan mengembalikan JournalRes
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ambil token dari header Authorization
                const { authorization } = param.headers;
                // Verifikasi token JWT
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                // Jika token tidak valid, hentikan eksekusi
                if (!token) {
                    throw new Error("Unauthorized: Invalid token or missing user ID");
                }
                // Ambil ID user dari token
                const id_user = token;
                try {
                    // Ambil data dari body request
                    const { date, description, lampiran, referensi, entries } = param.body;
                    // Validasi bahwa date dan entries wajib ada
                    if (!date || !entries) {
                        throw new Error("Bad Request: date and entries are required");
                    }
                    // Validasi entries: harus array tidak kosong
                    if (!Array.isArray(entries) || entries.length === 0) {
                        throw new Error("Bad Request: entries must be a non-empty array");
                    }
                    // Konversi format tanggal DD/MM/YYYY menjadi ISO string
                    const parts = date.split("/");
                    const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    const journalDate = new Date(isoDateString);
                    // Validasi format tanggal
                    if (isNaN(journalDate.getTime())) {
                        throw new Error(`Bad Request: Format tanggal tidak valid. Harusnya DD/MM/YYYY, diterima: ${date}`);
                    }
                    // Hitung total debit dan kredit untuk validasi akuntansi
                    let totalDebit = 0;
                    let totalCredit = 0;
                    for (const entry of entries) {
                        if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
                            throw new Error("Bad Request: debit and credit in entries must be numbers");
                        }
                        totalDebit += entry.debit;
                        totalCredit += entry.credit;
                    }
                    // Validasi keseimbangan debit dan kredit
                    if (totalDebit !== totalCredit) {
                        throw new Error("Bad Request: Total debit must equal total credit");
                    }
                    // Validasi tidak boleh 0
                    if (totalDebit === 0) {
                        throw new Error("Bad Request: Journal entries cannot have zero total value");
                    }
                    // Ambil semua code_account unik dari request
                    const accountCodesInRequest = [...new Set(entries.map(e => e.code_account))];
                    // Ambil data CoA yang sesuai dengan code_account request
                    const coaRecords = yield Coa_1.Coa.find({ where: { code_account: (0, typeorm_1.In)(accountCodesInRequest) } });
                    // Validasi semua code_account harus ada di database
                    if (coaRecords.length !== accountCodesInRequest.length) {
                        const foundCodes = new Set(coaRecords.map(acc => acc.code_account));
                        const missingCode = accountCodesInRequest.find(code => !foundCodes.has(code));
                        throw new Error(`Bad Request: Account with code_account '${missingCode}' is not found.`);
                    }
                    // Buat mapping code_account -> id CoA
                    const coaMap = new Map();
                    for (const coa of coaRecords) {
                        coaMap.set(coa.code_account, coa.id);
                    }
                    // Jalankan transaksi database (isolasi SERIALIZABLE)
                    const savedJournal = yield data_source_1.AppDataSource.manager.transaction("SERIALIZABLE", (transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        // Generate nomor bukti otomatis
                        const prefix = "JU";
                        const year = journalDate.getFullYear();
                        const month = String(journalDate.getMonth() + 1).padStart(2, '0');
                        const datePart = `${year}${month}`;
                        // Hitung jurnal yang sudah ada di bulan ini
                        const firstDayOfMonth = new Date(journalDate.getFullYear(), journalDate.getMonth(), 1);
                        const firstDayOfNextMonth = new Date(journalDate.getFullYear(), journalDate.getMonth() + 1, 1);
                        const journalCountInMonth = yield transactionalEntityManager.count(Journals_1.Journals, {
                            where: { id_user: id_user, date: (0, typeorm_1.Between)(firstDayOfMonth, firstDayOfNextMonth) }
                        });
                        // Nomor urut baru
                        const newSequenceNumber = journalCountInMonth + 1;
                        // Validasi batas nomor bukti
                        if (newSequenceNumber > 9999) {
                            throw new Error(`Batas nomor bukti (9999) untuk bulan ${month}/${year} telah tercapai.`);
                        }
                        // Format nomor bukti: JU-YYYYMM-XXXX
                        const sequencePart = String(newSequenceNumber).padStart(4, '0');
                        const generatedNomorBukti = `${prefix}-${datePart}-${sequencePart}`;
                        // Buat object jurnal baru
                        const journal = new Journals_1.Journals();
                        journal.id_user = id_user;
                        journal.date = journalDate;
                        journal.description = description;
                        journal.referensi = referensi;
                        journal.lampiran = lampiran;
                        journal.nomor_bukti = generatedNomorBukti;
                        // Simpan jurnal utama ke DB
                        yield transactionalEntityManager.save(journal);
                        // Simpan semua entri jurnal terkait
                        for (const entry of entries) {
                            const coaId = coaMap.get(entry.code_account);
                            if (!coaId) {
                                throw new Error(`Internal Error: Gagal memetakan code_account ${entry.code_account}`);
                            }
                            const journalEntry = new Journal_Entries_1.Journal_Entries();
                            journalEntry.id_journal = journal.id;
                            journalEntry.id_coa = coaId;
                            journalEntry.credit = entry.credit;
                            journalEntry.debit = entry.debit;
                            yield transactionalEntityManager.save(journalEntry);
                        }
                        // Return jurnal yang sudah disimpan
                        return journal;
                    }));
                    // Format tanggal kembali ke DD/MM/YYYY
                    const d = savedJournal.date;
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const yearFmt = d.getFullYear();
                    const formattedDate = `${day}/${month}/${yearFmt}`;
                    // Susun response sesuai tipe JournalRes
                    const response = {
                        id: savedJournal.id,
                        id_user: savedJournal.id_user,
                        date: formattedDate,
                        description: savedJournal.description || '',
                        referensi: savedJournal.referensi || '',
                        lampiran: savedJournal.lampiran || '',
                        nomor_bukti: savedJournal.nomor_bukti,
                        entries: entries
                    };
                    // Kembalikan response
                    return response;
                }
                catch (error) {
                    // Tangani semua error
                    console.error(error);
                    throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        },
    });
}
