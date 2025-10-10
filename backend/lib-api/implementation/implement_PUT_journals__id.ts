import { AppDataSource } from "../../data-source";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { PUT_journals__id_Req } from '../expressjs-aa/api/PUT_journals__id';
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { Entry } from '../ts-schema/Entry'
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_PUT_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'PUT /journals/:id',
    async fn(param: PUT_journals__id_Req): Promise<JournalRes> {
      // 

      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized: Missing token");
      }

      const id = Number(param.paths.id);
      if (isNaN(id) || id <= 0) {
        throw new Error("Bad Request: Invalid Journal ID format");
      }

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

       const updatedJournal = await AppDataSource.manager.transaction(async (em) => {
        const journalToUpdate = await em.findOne(Journals, { where: { id } });
        if (!journalToUpdate) {
          throw new Error("Not Found: Journal with this ID does not exist");
        }

        await em.delete(Journal_Entries, { id_journal: id });

        const newEntries = payload.entries.map(entry => {
          const newEntry = new Journal_Entries();
          newEntry.id_journal = id; // Gunakan ID jurnal yang ada
          newEntry.code_account = entry.code_account;
          newEntry.debit = entry.debit;
          newEntry.credit = entry.credit;
          return newEntry;
        });
        await em.save(newEntries);

        journalToUpdate.nomor_bukti = payload.nomor_bukti;
        journalToUpdate.date = new Date(payload.date);
        journalToUpdate.description = payload.description;
        journalToUpdate.referensi = payload.referensi;
        journalToUpdate.lampiran = payload.lampiran;
        await em.save(journalToUpdate);
        
        return { ...journalToUpdate, entries: newEntries };
      });

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
      } catch (error) {
        throw new Error('Gagal memperbarui jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}
