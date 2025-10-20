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
const typeorm_1 = require("typeorm");
const verifyToken_1 = require("../../fn/verifyToken");
const Coa_1 = require("../model/table/Coa");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: 'POST /journals',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) { // Pengecekan keamanan
                    throw new Error("Unauthorized: Invalid token or missing user ID");
                }
                const id_user = token;
<<<<<<< HEAD
                const { nomor_bukti, date, description, lampiran, referensi, entries } = param.body;
                if (!nomor_bukti || !date || !entries) {
                    throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                }
                if (!Array.isArray(entries) || entries.length === 0) {
                    throw new Error("Bad Request: entries must be a non-empty array");
                }
                // Validasi logika akuntansi
                let totalDebit = 0;
                let totalCredit = 0;
                for (const entry of entries) {
                    if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
                        throw new Error("Bad Request: debit and credit in entries must be numbers");
=======
                try {
                    const { nomor_bukti, date, description, lampiran, referensi, entries } = param.body;
                    if (!nomor_bukti || !date || !entries) {
                        throw new Error("Bad Request: nomor_bukti, date, and entries are required");
>>>>>>> main2
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
                        if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
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
                    // Simpan ke database menggunakan transaksi
                    const journal = new Journals_1.Journals();
                    journal.id_user = id_user;
                    journal.date = new Date(date);
                    journal.description = description;
                    journal.referensi = referensi;
                    journal.lampiran = lampiran;
                    journal.nomor_bukti = nomor_bukti;
                    yield journal.save();
                    for (const entry of entries) {
                        const journalEntry = new Journal_Entries_1.Journal_Entries();
                        journalEntry.id_journal = journal.id;
                        journalEntry.id_coa = entry.id_coa;
                        journalEntry.credit = entry.credit;
                        journalEntry.debit = entry.debit;
                        yield journalEntry.save();
                    }
                    const response = {
                        id: journal.id,
                        id_user: journal.id_user,
                        date: journal.date.toISOString(),
                        description: journal.description || '',
                        referensi: journal.referensi || '',
                        lampiran: journal.lampiran || '',
                        nomor_bukti: journal.nomor_bukti || '',
                        entries: entries
                    };
                    return response;
                }
                catch (error) {
                    console.error(error);
                    throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
