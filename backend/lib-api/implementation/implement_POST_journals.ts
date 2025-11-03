// Import modul TypeORM untuk operator query In dan Between
import { In, Between } from "typeorm"; 

// Import data source utama untuk transaksi database
import { AppDataSource } from "../../data-source";

// Import fungsi verifikasi JWT token
import { verifyToken } from "../../fn/verifyToken";

// Import wrapper ExpressAA untuk endpoint
import { ExpressAA } from "../expressjs-aa/ExpressAA";

// Import tipe request POST /journals
import { POST_journals_Req } from '../expressjs-aa/api/POST_journals';

// Import model Coa (Chart of Accounts)
import { Coa } from "../model/table/Coa";

// Import model Journal_Entries (entri jurnal)
import { Journal_Entries } from "../model/table/Journal_Entries";

// Import model Journals (tabel utama jurnal)
import { Journals } from "../model/table/Journals";

// Import tipe Entry untuk validasi entri
import { Entry } from '../ts-schema/Entry'

// Import tipe JournalRes untuk response
import { JournalRes } from '../ts-schema/JournalRes'

// Fungsi utama implementasi endpoint POST /journals
export function implement_POST_journals(engine: ExpressAA) {
  engine.implement({
    // Tentukan endpoint HTTP
    endpoint: "POST /journals",

    // Fungsi handler async yang menerima request dan mengembalikan JournalRes
    async fn(param: POST_journals_Req): Promise<JournalRes> {

      // Ambil token dari header Authorization
      const { authorization } = param.headers;

      // Verifikasi token JWT
      const token = await verifyToken(authorization);

      // Jika token tidak valid, hentikan eksekusi
      if (!token) {
        throw new Error("Unauthorized: Invalid token or missing user ID");
      }
      
      // Ambil ID user dari token
      const id_user = token;

      try {
        // Ambil data dari body request
        const {
          date, 
          description,
          lampiran,
          referensi,
          entries
        } = param.body;

        // Validasi bahwa date dan entries wajib ada
        if (!date || !entries) {
          throw new Error("Bad Request: date and entries are required");
        }

        // Validasi entries: harus array tidak kosong
        if (!Array.isArray(entries) || entries.length === 0) {
          throw new Error("Bad Request: entries must be a non-empty array");
        }

        // Konversi format tanggal DD/MM/YYYY menjadi ISO string
        const parts = date.split("/"); 
        const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        const journalDate = new Date(isoDateString);

        // Validasi format tanggal
        if (isNaN(journalDate.getTime())) {
            throw new Error(`Bad Request: Format tanggal tidak valid. Harusnya DD/MM/YYYY, diterima: ${date}`);
        }
        
        // Hitung total debit dan kredit untuk validasi akuntansi
        let totalDebit = 0;
        let totalCredit = 0;
        for (const entry of entries) {
          if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
              throw new Error("Bad Request: debit and credit in entries must be numbers");
          }
          totalDebit += entry.debit;
          totalCredit += entry.credit;
        }

        // Validasi keseimbangan debit dan kredit
        if (totalDebit !== totalCredit) {
          throw new Error("Bad Request: Total debit must equal total credit");
        }

        // Validasi tidak boleh 0
        if (totalDebit === 0) {
          throw new Error("Bad Request: Journal entries cannot have zero total value");
        }

        // Ambil semua code_account unik dari request
        const accountCodesInRequest = [...new Set(entries.map(e => e.code_account))];

        // Ambil data CoA yang sesuai dengan code_account request
        const coaRecords = await Coa.find({ where: { code_account: In(accountCodesInRequest) } });

        // Validasi semua code_account harus ada di database
        if (coaRecords.length !== accountCodesInRequest.length) {
          const foundCodes = new Set(coaRecords.map(acc => acc.code_account));
          const missingCode = accountCodesInRequest.find(code => !foundCodes.has(code));
          throw new Error(`Bad Request: Account with code_account '${missingCode}' is not found.`);
        }
        
        // Buat mapping code_account -> id CoA
        const coaMap = new Map<string, number>();
        for (const coa of coaRecords) {
            coaMap.set(coa.code_account, coa.id);
        }

        // Jalankan transaksi database (isolasi SERIALIZABLE)
        const savedJournal = await AppDataSource.manager.transaction(
          "SERIALIZABLE", 
          async (transactionalEntityManager) => {

            // Generate nomor bukti otomatis
            const prefix = "JU";
            const year = journalDate.getFullYear(); 
            const month = String(journalDate.getMonth() + 1).padStart(2, '0');
            const datePart = `${year}${month}`; 

            // Hitung jurnal yang sudah ada di bulan ini
            const firstDayOfMonth = new Date(journalDate.getFullYear(), journalDate.getMonth(), 1);
            const firstDayOfNextMonth = new Date(journalDate.getFullYear(), journalDate.getMonth() + 1, 1);

            const journalCountInMonth = await transactionalEntityManager.count(Journals, {
                where: { id_user: id_user, date: Between(firstDayOfMonth, firstDayOfNextMonth) }
            });

            // Nomor urut baru
            const newSequenceNumber = journalCountInMonth + 1;

            // Validasi batas nomor bukti
            if (newSequenceNumber > 9999) {
              throw new Error(`Batas nomor bukti (9999) untuk bulan ${month}/${year} telah tercapai.`);
            }

            // Format nomor bukti: JU-YYYYMM-XXXX
            const sequencePart = String(newSequenceNumber).padStart(4, '0');
            const generatedNomorBukti = `${prefix}-${datePart}-${sequencePart}`;
            
            // Buat object jurnal baru
            const journal = new Journals();
            journal.id_user = id_user; 
            journal.date = journalDate; 
            journal.description = description;
            journal.referensi = referensi;
            journal.lampiran = lampiran;
            journal.nomor_bukti = generatedNomorBukti;
            
            // Simpan jurnal utama ke DB
            await transactionalEntityManager.save(journal);
            
            // Simpan semua entri jurnal terkait
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

            // Return jurnal yang sudah disimpan
            return journal; 
          }
        ); 

        // Format tanggal kembali ke DD/MM/YYYY
        const d = savedJournal.date; 
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); 
        const yearFmt = d.getFullYear();
        const formattedDate = `${day}/${month}/${yearFmt}`;

        // Susun response sesuai tipe JournalRes
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
        
        // Kembalikan response
        return response;
        
      } catch (error) {
        // Tangani semua error
        console.error(error)
        throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    },
  });
}