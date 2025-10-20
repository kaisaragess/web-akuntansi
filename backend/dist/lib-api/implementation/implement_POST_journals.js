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
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: "POST /journals",
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) {
                    throw new Error("Unauthorized: Invalid token or missing user ID ");
                }
                const id_user = token;
                try {
                    const { nomor_bukti, date, description, lampiran, referensi, entries } = param.body;
                    if (!nomor_bukti || !date || !entries) {
                        throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                    }
                    if (!Array.isArray(entries) || entries.length === 0) {
                        throw new Error("Bad Request: entries must be a non-empty array");
                    }
                    const journalDate = new Date(date);
                    if (isNaN(journalDate.getTime())) {
                        throw new Error("Bad Request: Invalid date format");
                    }
                    // Validasi logika akuntansi
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
                    // 🟢 Simpan ke database menggunakan transaksi
                    const newJournal = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        // 1️⃣ Simpan jurnal utama
                        const journal = new Journals_1.Journals();
                        journal.id_user = id_user;
                        journal.date = journalDate;
                        journal.description = description;
                        journal.referensi = referensi;
                        journal.lampiran = lampiran;
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
                    };
                }
                catch (error) {
                    throw new Error("Gagal membuat jurnal baru." +
                        (error instanceof Error ? " Detail: " + error.message : ""));
                }
            });
        },
    });
}
