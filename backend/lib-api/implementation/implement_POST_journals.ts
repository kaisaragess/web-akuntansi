import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_journals_Req } from '../expressjs-aa/api/POST_journals';
import { Coa } from "../model/table/Coa";
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { Token } from "../model/table/Token";
import { Entry } from '../ts-schema/Entry'
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_POST_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /journals',
    async fn(param: POST_journals_Req): Promise<JournalRes> {
      // Verifikasi token dan dapatkan id_user
      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized: Invalid token or missing user ID ");
      }

      const id_user = token;

      try {
        const {
          nomor_bukti,
          date,
          description,
          lampiran,
          referensi,
          entries
        } = param.body;

        
      
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

        const coaRecords = await Coa.find({
          where: { code_account: In(accountCodesInRequest) }
        });

        if (coaRecords.length !== accountCodesInRequest.length) {
          const foundCodes = new Set(coaRecords.map(acc => acc.code_account));
          const missingCode = accountCodesInRequest.find(code => !foundCodes.has(code));
          throw new Error(`Bad Request: Account with code_account '${missingCode}' is not found.`);
        }
        
        const coaMap = new Map<string, number>();
        for (const coa of coaRecords) {
            coaMap.set(coa.code_account, coa.id);
        }

        // Simpan ke database menggunakan transaksi
          const journal = new Journals();
          journal.id_user = id_user; 
          journal.date = journalDate;
          journal.description = description;
          journal.referensi = referensi;
          journal.lampiran = lampiran;
          journal.nomor_bukti = nomor_bukti;
          
          await journal.save();
          
          for (const entry of entries as Entry[]) {
            const journalEntry = new Journal_Entries();
            journalEntry.id_journal = journal.id;
            journalEntry.id_coa = entry.id_coa;
            journalEntry.credit = entry.credit;
            journalEntry.debit = entry.debit;
            await journalEntry.save();
          }

          const response: JournalRes = {
            id: journal.id,
            id_user: journal.id_user,
            date: journal.date.toISOString(),
            description: journal.description || '',
            referensi: journal.referensi || '',
            lampiran: journal.lampiran || '',
            nomor_bukti: journal.nomor_bukti || '',
            entries: entries
          }
          

        return response;
        
      } catch (error) {
        console.error(error)
        throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}
