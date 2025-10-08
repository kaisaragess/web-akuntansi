import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_journals__id_Req } from '../expressjs-aa/api/GET_journals__id';
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_GET_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /journals/:id',
    async fn(param: GET_journals__id_Req): Promise<JournalRes> {
      // 

      const { authorization } = param.headers;
      const token = verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized: Missing token");
      }

      const { id } = param.paths;
      if (!id) {
        throw new Error("Bad Request: Missing Journal ID");
      }

      const existingJournal = await Journals.findOneBy({ 
        id: Number(id)
      });

      const existingJournal_with_entries = await Journal_Entries.find({
        where: { id_journal: Number(id) }
      });

      if (existingJournal) {
        (existingJournal as any).entries = existingJournal_with_entries;
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
          id_coa: entry.code_coa,
          debit: entry.debit,
          credit: entry.credit
        })) // Placeholder, implement fetching entries if needed
      }; // Kembalikan detail jurnal yang ditemukan
    }
  });
}
