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
const verifyToken_1 = require("../../fn/verifyToken");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
function implement_GET_journals__id(engine) {
    engine.implement({
        endpoint: 'GET /journals/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) {
                    throw new Error("Unauthorized: Missing token");
                }
                const { id } = param.paths;
                if (!id) {
                    throw new Error("Bad Request: Missing Journal ID");
                }
                const existingJournal = yield Journals_1.Journals.findOneBy({
                    id: Number(id)
                });
                const existingJournal_with_entries = yield Journal_Entries_1.Journal_Entries.find({
                    where: { id_journal: Number(id) }
                });
                if (existingJournal) {
                    existingJournal.entries = existingJournal_with_entries;
                }
                if (!existingJournal_with_entries) {
                    throw new Error("Not Found: Journal entries do not exist");
                }
                if (!existingJournal) {
                    throw new Error("Not Found: Journal record does not exist");
                }
                return {
                    id: existingJournal.id,
                    id_user: existingJournal.id_user,
                    nomor_bukti: existingJournal.nomor_bukti,
                    date: existingJournal.date.toISOString(),
                    description: existingJournal.description,
                    lampiran: existingJournal.lampiran,
                    referensi: existingJournal.referensi,
                    entries: existingJournal_with_entries.map(entry => ({
                        code_account: entry.code_account,
                        debit: entry.debit,
                        credit: entry.credit
                    })) // Placeholder, implement fetching entries if needed
                }; // Kembalikan detail jurnal yang ditemukan
            });
        }
    });
}
