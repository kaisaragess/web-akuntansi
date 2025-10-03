import { AppDataSource } from "../../data-source";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_journals_Req } from '../expressjs-aa/api/POST_journals';
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { Token } from "../model/table/Token";
import { Entry } from '../ts-schema/Entry'
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_POST_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /journals',
    async fn(param: POST_journals_Req): Promise<JournalRes> {
      // 

      const { authorization: authorization } = param.headers;
      const token = verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized");
      };
      

      // const id_user = token.id_user;

      // // Validate the request body
      // const {
      //   nomor_bukti,
      //   date,
      //   description,
      //   lampiran,
      //   referensi,
      //   entries
      // } = param.body;
      

      // if (!nomor_bukti || !date || !entries) {
      //   throw new Error("Bad Request: nomor_bukti, date, and entries are required");
      // }
      // if (!Array.isArray(entries) || entries.length === 0) {
      //   throw new Error("Bad Request: entries must be a non-empty array");
      // }

      // let totalDebit = 0;
      // let totalCredit = 0;
      // for (const entry of entries) {
      //   if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
      //      throw new Error("Bad Request: debit and credit in entries must be numbers");
      //   }
      //   totalDebit += entry.debit;
      //   totalCredit += entry.credit;
      // }

      // if (totalDebit !== totalCredit) {
      //   throw new Error("Bad Request: Total debit must equal total credit");
      // }
      // if (totalDebit === 0) {
      //   throw new Error("Bad Request: Journal entries cannot have zero total value");
      // }

      //       const newJournal = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      //   // Langkah 1: Buat instance baru dari entity Journals
      //   const journal = new Journals();
      //   journal.id_user = ; // Ganti dengan ID user yang sesuai dari token
      //   journal.date = new Date(date);
      //   journal.description = description;
      //   journal.referensi = referensi;
      //   journal.lampiran = lampiran;
      //   journal.nomor_bukti = nomor_bukti;
        
      //   // Simpan record utama ke tabel "Journals"
      //   await transactionalEntityManager.save(journal);

      //   // Langkah 2: Buat array dari instance Journal_Entries
      //   const journalEntriesArray = entries.map(entry => {
      //     const newEntry = new Journal_Entries();
      //     newEntry.journal = journal; // Hubungkan entry ke jurnal yang baru dibuat
      //     newEntry.code_coa = entry.id_coa;
      //     newEntry.debit = entry.debit;
      //     newEntry.credit = entry.credit;
      //     return newEntry;
      //   });

      //   // Langkah 3: Simpan semua record entries dalam satu operasi
      //   await transactionalEntityManager.save(journalEntriesArray);

      //   // Return jurnal yang baru dibuat beserta entries-nya
      //   return { ...journal, entries: journalEntriesArray };
      // });



      



      return {} as any;
    }
  });
}
