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
// --- BARU --- Impor 'Between' untuk query tanggal dan 'AppDataSource' untuk transaksi
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
// --- AKHIR BARU ---
const verifyToken_1 = require("../../fn/verifyToken");
const Coa_1 = require("../model/table/Coa");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: "POST /journals",
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
=======
                // 
>>>>>>> 4b39f389df0944121653e7f6c9dff42220518cba
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) { // Pengecekan keamanan
                    throw new Error("Unauthorized: Invalid token or missing user ID");
                }
                const id_user = token;
                try {
                    const { date, description, lampiran, referensi, entries } = param.body;
                    if (!date || !entries) {
                        throw new Error("Bad Request: date and entries are required");
                    }
                    if (!Array.isArray(entries) || entries.length === 0) {
                        throw new Error("Bad Request: entries must be a non-empty array");
                    }
                    const parts = date.split("/");
                    const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    const journalDate = new Date(isoDateString);
                    if (isNaN(journalDate.getTime())) {
                        throw new Error(`Bad Request: Format tanggal tidak valid. Harusnya DD/MM/YYYY, diterima: ${date}`);
                    }
                    // (Validasi logika akuntansi pindah ke atas, sebelum transaksi)
                    let totalDebit = 0;
                    let totalCredit = 0;
                    for (const entry of entries) {
                        if (typeof entry.debit !== "number" ||
                            typeof entry.credit !== "number") {
                            throw new Error("Bad Request: debit and credit in entries must be numbers");
                        }
                        totalDebit += entry.debit;
                        totalCredit += entry.credit;
                    }
                    if (totalDebit !== totalCredit) {
                        throw new Error("Bad Request: Total debit must equal total credit");
                    }
                    if (totalDebit === 0) {
                        throw new Error("Bad Request: Journal entries cannot have zero total value");
                    }
<<<<<<< HEAD
                    // 🟢 Simpan ke database menggunakan transaksi
                    const newJournal = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        // 1️⃣ Simpan jurnal utama
=======
                    // (Validasi Coa juga pindah ke atas, sebelum transaksi)
                    const accountCodesInRequest = [...new Set(entries.map(e => e.code_account))];
                    const coaRecords = yield Coa_1.Coa.find({
                        where: { code_account: (0, typeorm_1.In)(accountCodesInRequest) }
                    });
                    if (coaRecords.length !== accountCodesInRequest.length) {
                        const foundCodes = new Set(coaRecords.map(acc => acc.code_account));
                        const missingCode = accountCodesInRequest.find(code => !foundCodes.has(code));
                        throw new Error(`Bad Request: Account with code_account '${missingCode}' is not found.`);
                    }
                    const coaMap = new Map();
                    for (const coa of coaRecords) {
                        coaMap.set(coa.code_account, coa.id);
                    }
                    const savedJournal = yield data_source_1.AppDataSource.manager.transaction("SERIALIZABLE", (transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        const prefix = "JU";
                        const year = journalDate.getFullYear();
                        const month = String(journalDate.getMonth() + 1).padStart(2, '0');
                        const datePart = `${year}${month}`;
                        const firstDayOfMonth = new Date(journalDate.getFullYear(), journalDate.getMonth(), 1);
                        const firstDayOfNextMonth = new Date(journalDate.getFullYear(), journalDate.getMonth() + 1, 1);
                        // Hitung jumlah jurnal di bulan ini untuk user ini
                        const journalCountInMonth = yield transactionalEntityManager.count(Journals_1.Journals, {
                            where: {
                                id_user: id_user,
                                date: (0, typeorm_1.Between)(firstDayOfMonth, firstDayOfNextMonth)
                            }
                        });
                        const newSequenceNumber = journalCountInMonth + 1;
                        if (newSequenceNumber > 9999) {
                            throw new Error(`Batas nomor bukti (9999) untuk bulan ${month}/${year} telah tercapai.`);
                        }
                        const sequencePart = String(newSequenceNumber).padStart(4, '0');
                        const generatedNomorBukti = `${prefix}-${datePart}-${sequencePart}`;
>>>>>>> 4b39f389df0944121653e7f6c9dff42220518cba
                        const journal = new Journals_1.Journals();
                        journal.id_user = id_user;
                        journal.date = journalDate;
                        journal.description = description;
                        journal.referensi = referensi;
                        journal.lampiran = lampiran;
<<<<<<< HEAD
                        journal.nomor_bukti = nomor_bukti;
                        const savedJournal = yield transactionalEntityManager.save(journal);
                        // Pastikan id_journal benar-benar ada
                        if (!savedJournal.id) {
                            throw new Error("Failed to generate journal ID. Please check table Journals primary key.");
                        }
                        // 2️⃣ Simpan semua entries yang terhubung ke jurnal ini
                        const journalEntriesArray = entries.map((entry) => {
                            const newEntry = new Journal_Entries_1.Journal_Entries();
                            newEntry.id_journal = savedJournal.id; // <- sudah pasti ada ID
                            newEntry.code_account = entry.code_account;
                            newEntry.debit = entry.debit;
                            newEntry.credit = entry.credit;
                            return newEntry;
                        });
                        yield transactionalEntityManager.save(journalEntriesArray);
                        // Return jurnal yang sudah tersimpan
                        return Object.assign(Object.assign({}, savedJournal), { entries: journalEntriesArray });
                    }));
                    // 🧾 Format response
                    return {
                        id: newJournal.id,
                        id_user: newJournal.id_user,
                        date: newJournal.date.toISOString(),
                        description: newJournal.description || "",
                        referensi: newJournal.referensi || "",
                        lampiran: newJournal.lampiran || "",
                        nomor_bukti: newJournal.nomor_bukti || "",
                        entries: newJournal.entries.map((e) => ({
                            code_account: e.code_account,
                            debit: e.debit,
                            credit: e.credit,
                        })),
=======
                        journal.nomor_bukti = generatedNomorBukti;
                        yield transactionalEntityManager.save(journal);
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
                        return journal;
                    }));
                    const d = savedJournal.date;
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const yearFmt = d.getFullYear();
                    const formattedDate = `${day}/${month}/${yearFmt}`;
                    const response = {
                        id: savedJournal.id,
                        id_user: savedJournal.id_user,
                        date: formattedDate,
                        description: savedJournal.description || '',
                        referensi: savedJournal.referensi || '',
                        lampiran: savedJournal.lampiran || '',
                        nomor_bukti: savedJournal.nomor_bukti,
                        entries: entries
>>>>>>> 4b39f389df0944121653e7f6c9dff42220518cba
                    };
                    return response;
                }
                catch (error) {
<<<<<<< HEAD
                    throw new Error("Gagal membuat jurnal baru." +
                        (error instanceof Error ? " Detail: " + error.message : ""));
=======
                    console.error(error);
                    throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
>>>>>>> 4b39f389df0944121653e7f6c9dff42220518cba
                }
            });
        },
    });
}
