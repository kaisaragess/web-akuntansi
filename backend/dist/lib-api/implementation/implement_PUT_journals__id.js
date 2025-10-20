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
const verifyToken_1 = require("../../fn/verifyToken");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
function implement_PUT_journals__id(engine) {
    engine.implement({
        endpoint: 'PUT /journals/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) {
                    throw new Error("Unauthorized: Missing token");
                }
                const id = Number(param.paths.id);
                if (isNaN(id) || id <= 0) {
                    throw new Error("Bad Request: Invalid Journal ID format");
                }
<<<<<<< HEAD
                const payload = param.body;
                if (!payload || !payload.nomor_bukti || !payload.date || !payload.entries) {
                    throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                }
                try {
                    let totalDebit = 0;
                    let totalCredit = 0;
                    for (const entry of payload.entries) {
                        totalDebit += entry.debit;
                        totalCredit += entry.credit;
                    }
                    if (totalDebit !== totalCredit) {
                        throw new Error("Bad Request: Total debit must equal total credit");
                    }
                    const updatedJournal = yield data_source_1.AppDataSource.manager.transaction((em) => __awaiter(this, void 0, void 0, function* () {
                        const journalToUpdate = yield em.findOne(Journals_1.Journals, { where: { id } });
                        if (!journalToUpdate) {
                            throw new Error("Not Found: Journal with this ID does not exist");
                        }
                        yield em.delete(Journal_Entries_1.Journal_Entries, { id_journal: id });
                        const newEntries = payload.entries.map(entry => {
                            const newEntry = new Journal_Entries_1.Journal_Entries();
                            newEntry.id_journal = id; // Gunakan ID jurnal yang ada
                            newEntry.code_account = entry.code_account;
                            newEntry.debit = entry.debit;
                            newEntry.credit = entry.credit;
                            return newEntry;
                        });
                        yield em.save(newEntries);
                        journalToUpdate.nomor_bukti = payload.nomor_bukti;
                        journalToUpdate.date = new Date(payload.date);
                        journalToUpdate.description = payload.description;
                        journalToUpdate.referensi = payload.referensi;
                        journalToUpdate.lampiran = payload.lampiran;
                        yield em.save(journalToUpdate);
                        return Object.assign(Object.assign({}, journalToUpdate), { entries: newEntries });
                    }));
                    return {
                        id: updatedJournal.id,
                        id_user: updatedJournal.id_user,
                        nomor_bukti: updatedJournal.nomor_bukti,
                        date: updatedJournal.date.toISOString(),
                        description: updatedJournal.description || '',
                        referensi: updatedJournal.referensi || '',
                        lampiran: updatedJournal.lampiran || '',
                        entries: updatedJournal.entries.map(e => ({
                            code_account: e.code_account,
                            debit: e.debit,
                            credit: e.credit
                        })),
                    };
                }
                catch (error) {
                    throw new Error('Gagal memperbarui jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
=======
                const journal = yield Journals_1.Journals.findOne({ where: { id } });
                if (!journal) {
                    throw new Error("Jurnal tidak ditemukan");
                }
                const { date, entries, nomor_bukti, description, lampiran, referensi } = param.body;
                if (!nomor_bukti || !date || !entries) {
                    throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                }
                journal.nomor_bukti = nomor_bukti;
                journal.date = new Date(date);
                journal.description = description || "";
                journal.lampiran = lampiran || "";
                journal.referensi = referensi || "";
                yield journal.save();
                yield Journal_Entries_1.Journal_Entries.delete({ id_journal: journal.id });
                for (const entry of entries) {
                    const newEntry = new Journal_Entries_1.Journal_Entries();
                    newEntry.id_journal = journal.id;
                    newEntry.id_coa = entry.id_coa;
                    newEntry.debit = entry.debit;
                    newEntry.credit = entry.credit;
                    yield newEntry.save();
                }
                // 🔁 Ambil ulang jurnal beserta entries
                const updatedEntries = yield Journal_Entries_1.Journal_Entries.find({ where: { id_journal: journal.id } });
                const result = {
                    id: journal.id,
                    id_user: journal.id_user,
                    nomor_bukti: journal.nomor_bukti,
                    date: date,
                    description: journal.description,
                    lampiran: journal.lampiran,
                    referensi: journal.referensi,
                    entries: entries
                };
                return result;
>>>>>>> main2
            });
        }
    });
}
