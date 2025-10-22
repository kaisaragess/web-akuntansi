// --- BARU --- Impor 'Between' untuk query tanggal dan 'AppDataSource' untuk transaksi
import { In, Between } from "typeorm"; 
import { AppDataSource } from "../../data-source";
// --- AKHIR BARU ---
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
    endpoint: "POST /journals",
    async fn(param: POST_journals_Req): Promise<JournalRes> {
      // 
      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) { // Pengecekan keamanan
        throw new Error("Unauthorized: Invalid token or missing user ID");
      }
      
      const id_user = token;

      try {
        const {
          date, 
          description,
          lampiran,
          referensi,
          entries
        } = param.body;

        
        if (!date || !entries) {
          throw new Error("Bad Request: date and entries are required");
        }
        if (!Array.isArray(entries) || entries.length === 0) {
          throw new Error(
            "Bad Request: entries must be a non-empty array"
          );
        }

        const parts = date.split("/"); 
        const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        const journalDate = new Date(isoDateString);

        if (isNaN(journalDate.getTime())) {
            throw new Error(`Bad Request: Format tanggal tidak valid. Harusnya DD/MM/YYYY, diterima: ${date}`);
        }
        
        // (Validasi logika akuntansi pindah ke atas, sebelum transaksi)
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
          throw new Error(
            "Bad Request: Journal entries cannot have zero total value"
          );
        }

        // (Validasi Coa juga pindah ke atas, sebelum transaksi)
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

        const savedJournal = await AppDataSource.manager.transaction(
          "SERIALIZABLE", 
          async (transactionalEntityManager) => {

            const prefix = "JU";
            const year = journalDate.getFullYear(); 
            const month = String(journalDate.getMonth() + 1).padStart(2, '0');
            const datePart = `${year}${month}`; 

            const firstDayOfMonth = new Date(journalDate.getFullYear(), journalDate.getMonth(), 1);
            const firstDayOfNextMonth = new Date(journalDate.getFullYear(), journalDate.getMonth() + 1, 1);

            // Hitung jumlah jurnal di bulan ini untuk user ini
            const journalCountInMonth = await transactionalEntityManager.count(Journals, {
                where: {
                    id_user: id_user,
                    date: Between(firstDayOfMonth, firstDayOfNextMonth)
                }
            });

            const newSequenceNumber = journalCountInMonth + 1;

            if (newSequenceNumber > 9999) {
              throw new Error(`Batas nomor bukti (9999) untuk bulan ${month}/${year} telah tercapai.`);
            }

            const sequencePart = String(newSequenceNumber).padStart(4, '0');
            
            const generatedNomorBukti = `${prefix}-${datePart}-${sequencePart}`;
            
            const journal = new Journals();
            journal.id_user = id_user; 
            journal.date = journalDate; 
            journal.description = description;
            journal.referensi = referensi;
            journal.lampiran = lampiran;
            journal.nomor_bukti = generatedNomorBukti;
            
            await transactionalEntityManager.save(journal);
            
            for (const entry of entries as Entry[]) {
              const coaId = coaMap.get(entry.code_account);

              if (!coaId) { 
                throw new Error(`Internal Error: Gagal memetakan code_account ${entry.code_account}`);
              }
              
              const journalEntry = new Journal_Entries();
              journalEntry.id_journal = journal.id; 
              journalEntry.id_coa = coaId; 
              journalEntry.credit = entry.credit;
              journalEntry.debit = entry.debit;
              
              await transactionalEntityManager.save(journalEntry);
            }

            return journal; 
          }
        ); 

        const d = savedJournal.date; 
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); 
        const yearFmt = d.getFullYear();
        const formattedDate = `${day}/${month}/${yearFmt}`;

        const response: JournalRes = {
          id: savedJournal.id,
          id_user: savedJournal.id_user,
          date: formattedDate, 
          description: savedJournal.description || '',
          referensi: savedJournal.referensi || '',
          lampiran: savedJournal.lampiran || '',
          nomor_bukti: savedJournal.nomor_bukti, 
          entries: entries 
        }
        
      return response;
        
      } catch (error) {
        console.error(error)
        throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    },
  });
}
