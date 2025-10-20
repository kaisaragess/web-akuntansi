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
      const journal = await Journals.findOne({ where: { id } });
      if (!journal) {
        throw new Error("Jurnal tidak ditemukan");
      }

      const {date, entries, nomor_bukti, description, lampiran, referensi} = param.body;

      if (!nomor_bukti || !date || !entries) {
        throw new Error("Bad Request: nomor_bukti, date, and entries are required");
      }

      journal.nomor_bukti = nomor_bukti;
      journal.date = new Date(date);
      journal.description = description || "";
      journal.lampiran = lampiran || "";
      journal.referensi = referensi || "";
      await journal.save();

      await Journal_Entries.delete({ id_journal: journal.id });

      for (const entry of entries as Entry[]) {
        const newEntry = new Journal_Entries();
        newEntry.id_journal = journal.id;
        newEntry.id_coa = entry.id_coa;
        newEntry.debit = entry.debit;
        newEntry.credit = entry.credit;
        await newEntry.save();
      }

      // 🔁 Ambil ulang jurnal beserta entries
      const updatedEntries = await Journal_Entries.find({ where: { id_journal: journal.id } });

      const result: JournalRes = {
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
    }
  });
}
