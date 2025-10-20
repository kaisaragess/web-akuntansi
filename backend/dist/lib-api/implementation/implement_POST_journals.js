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
const data_source_1 = require("../../data-source");
const verifyToken_1 = require("../../fn/verifyToken");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
const Coa_1 = require("../model/table/Coa"); // ASUMSI: Entitas Master Akun
const User_1 = require("../model/table/User"); // ASUMSI: Entitas Master User
const typeorm_1 = require("typeorm"); // Penting untuk query IN
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: 'POST /journals',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // --- 1. Verifikasi Token & ID User ---
                const { authorization } = param.headers;
                const id_user = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!id_user) {
                    throw new Error("Unauthorized: Invalid token or missing user ID.");
                }
                try {
                    const { nomor_bukti, date, description, lampiran, referensi, entries } = param.body;
                    // --- 2. Validasi Logika Bisnis & Format ---
                    if (!nomor_bukti || !date || !entries) {
                        throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                    }
                    if (!Array.isArray(entries) || entries.length < 2) {
                        throw new Error("Bad Request: entries must be an array with at least two records");
                    }
                    const journalDate = new Date(date);
                    if (isNaN(journalDate.getTime())) {
                        throw new Error("Bad Request: Invalid date format. Use YYYY-MM-DD");
                    }
                    // Validasi Akuntansi & Kumpulkan Kode Akun
                    let totalDebit = 0;
                    let totalCredit = 0;
                    const uniqueAccountCodes = new Set();
                    for (const entry of entries) {
                        if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
                            throw new Error("Bad Request: debit and credit in entries must be numbers");
                        }
                        totalDebit += entry.debit;
                        totalCredit += entry.credit;
                        uniqueAccountCodes.add(entry.code_account);
                    }
                    if (Math.abs(totalDebit - totalCredit) > 0.01) {
                        throw new Error("Bad Request: Total debit must equal total credit");
                    }
                    if (totalDebit === 0) {
                        throw new Error("Bad Request: Journal entries cannot have zero total value");
                    }
                    // --- 3. VALIDASI FOREIGN KEY TERHADAP DATABASE ---
                    const transactionalEntityManager = data_source_1.AppDataSource.manager;
                    // A. Validasi ID User (FK ke tabel User)
                    const userRepo = transactionalEntityManager.getRepository(User_1.User);
                    const userExists = yield userRepo.findOneBy({ id: id_user });
                    if (!userExists) {
                        throw new Error("Foreign Key Violation: id_user tidak ditemukan atau tidak valid.");
                    }
                    // B. Validasi Code Account (FK ke tabel Coa)
                    const accountRepo = transactionalEntityManager.getRepository(Coa_1.Coa);
                    // PENTING: Gunakan 'code' sebagai nama kolom, dan HILANGKAN is_active
                    const existingAccounts = yield accountRepo.findBy({
                        code_account: (0, typeorm_1.In)(Array.from(uniqueAccountCodes))
                    });
                    if (existingAccounts.length !== uniqueAccountCodes.size) {
                        // Gunakan 'a.code' untuk memetakan hasil query
                        const foundCodes = existingAccounts.map(a => a.code); // Cast to any jika TypeORM tidak mengenali 'code'
                        const missingCodes = Array.from(uniqueAccountCodes).filter(code => !foundCodes.includes(code));
                        throw new Error(`Foreign Key Violation: Kode akun (${missingCodes.join(', ')}) tidak ditemukan di COA.`);
                    }
                    // --- 4. Simpan ke database menggunakan Transaksi ---
                    const newJournal = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        const journal = new Journals_1.Journals();
                        journal.id_user = id_user;
                        journal.date = journalDate;
                        journal.description = description;
                        journal.referensi = referensi;
                        journal.lampiran = lampiran;
                        journal.nomor_bukti = nomor_bukti;
                        yield transactionalEntityManager.save(journal); // Simpan Journal header
                        const journalEntriesArray = entries.map(entry => {
                            const newEntry = new Journal_Entries_1.Journal_Entries();
                            newEntry.id_journal = journal.id; // FK Journals
                            newEntry.code_account = entry.code_account; // FK Coa
                            newEntry.debit = entry.debit;
                            newEntry.credit = entry.credit;
                            return newEntry;
                        });
                        yield transactionalEntityManager.save(journalEntriesArray); // Simpan Entries
                        return Object.assign(Object.assign({}, journal), { entries: journalEntriesArray });
                    }));
                    // --- 5. Format Respon Sukses ---
                    return {
                        id: newJournal.id,
                        id_user: newJournal.id_user,
                        date: newJournal.date.toISOString(),
                        description: newJournal.description || '',
                        referensi: newJournal.referensi || '',
                        lampiran: newJournal.lampiran || '',
                        nomor_bukti: newJournal.nomor_bukti || '',
                        entries: newJournal.entries.map(e => ({
                            code_account: e.code_account,
                            debit: e.debit,
                            credit: e.credit
                        })),
                    };
                }
                catch (error) {
                    throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
