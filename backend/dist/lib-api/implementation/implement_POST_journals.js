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
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: 'POST /journals',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
<<<<<<< HEAD
=======
                //   const { authorization: authorization } = param.headers;
                //   const token = verifyToken(authorization);
                //   if (!token) {
                //     throw new Error("Unauthorized");
                //   }
                // ;
                //   const id_user = tokenRecord.id_user;
                //   // Validate the request body
                //   const {
                //     nomor_bukti,
                //     date,
                //     description,
                //     lampiran,
                //     referensi,
                //     entries
                //   } = param.body;
                //   if (!nomor_bukti || !date || !entries) {
                //     throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                //   }
                //   if (!Array.isArray(entries) || entries.length === 0) {
                //     throw new Error("Bad Request: entries must be a non-empty array");
                //   }
                //   let totalDebit = 0;
                //   let totalCredit = 0;
                //   for (const entry of entries) {
                //     if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
                //        throw new Error("Bad Request: debit and credit in entries must be numbers");
                //     }
                //     totalDebit += entry.debit;
                //     totalCredit += entry.credit;
                //   }
                //   if (totalDebit !== totalCredit) {
                //     throw new Error("Bad Request: Total debit must equal total credit");
                //   }
                //   if (totalDebit === 0) {
                //     throw new Error("Bad Request: Journal entries cannot have zero total value");
                //   }
                //         const newJournal = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                //     // Langkah 1: Buat instance baru dari entity Journals
                //     const journal = new Journals();
                //     journal.id_user = ;
                //     journal.date = new Date(date);
                //     journal.description = description;
                //     journal.referensi = referensi;
                //     journal.lampiran = lampiran;
                //     journal.nomor_bukti = nomor_bukti;
                //     // Simpan record utama ke tabel "Journals"
                //     await transactionalEntityManager.save(journal);
                //     // Langkah 2: Buat array dari instance Journal_Entries
                //     const journalEntriesArray = entries.map(entry => {
                //       const newEntry = new Journal_Entries();
                //       newEntry.journal = journal; // Hubungkan entry ke jurnal yang baru dibuat
                //       newEntry.code_coa = entry.id_coa;
                //       newEntry.debit = entry.debit;
                //       newEntry.credit = entry.credit;
                //       return newEntry;
                //     });
                //     // Langkah 3: Simpan semua record entries dalam satu operasi
                //     await transactionalEntityManager.save(journalEntriesArray);
                //     // Return jurnal yang baru dibuat beserta entries-nya
                //     return { ...journal, entries: journalEntriesArray };
                //   });
>>>>>>> dbe8a9a2aa8ba3655cbba3c93a05f82fd33d3221
                return {};
            });
        }
    });
}
