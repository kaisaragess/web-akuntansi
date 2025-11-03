import { GET_journals__id_Req } from '../expressjs-aa/api/GET_journals__id';
import { verifyToken } from "../../fn/verifyToken"; // Import fungsi untuk verifikasi JWT
import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { Journal_Entries } from "../model/table/Journal_Entries"; // Import model Journal_Entries dari database
import { Journals } from "../model/table/Journals"; // Import model Journals dari database
import { JournalRes } from '../ts-schema/JournalRes' // Import tipe response untuk jurnal

export function implement_GET_journals__id(engine: ExpressAA) {
  // Fungsi utama untuk mendaftarkan endpoint GET /journals/:id
  engine.implement({
    endpoint: 'GET /journals/:id', // Menentukan HTTP method dan route endpoint

    async fn(param: GET_journals__id_Req): Promise<JournalRes> {
      // === 1. Ambil token dari header dan lakukan verifikasi ===
      const { authorization } = param.headers;
      const token = await verifyToken(authorization); // Verifikasi JWT
      if (!token) { // Jika token tidak valid
        throw new Error("Unauthorized: Missing token"); // Lempar error 401
      }

      // === 2. Ambil parameter ID jurnal dari path ===
      const { id } = param.paths;
      if (!id) { // Validasi apakah ID diberikan
        throw new Error("Bad Request: Missing Journal ID"); // Lempar error 400
      }

      try {
        // === 3. Cari data jurnal berdasarkan ID ===
        const existingJournal = await Journals.findOneBy({ 
          id: Number(id) 
        });

        // === 4. Cari semua entri jurnal yang berelasi dengan ID jurnal ===
        const existingJournal_with_entries = await Journal_Entries.find({
          where: { id_journal: Number(id) }
        });

        // === 5. Tambahkan daftar entries ke objek jurnal (opsional casting ke any) ===
        if (existingJournal) {
          (existingJournal as any).entries = existingJournal_with_entries;
        }

        // === 6. Validasi apakah entries ditemukan ===
        if (!existingJournal_with_entries) {
          throw new Error("Not Found: Journal entries do not exist"); // Lempar error 404
        }

        // === 7. Validasi apakah jurnal ditemukan ===
        if (!existingJournal) {
          throw new Error("Not Found: Journal record does not exist"); // Lempar error 404
        }

        // === 8. Bentuk respons sesuai dengan tipe JournalRes ===
        return {
          id: existingJournal.id,
          id_user: existingJournal.id_user,
          nomor_bukti: existingJournal.nomor_bukti,
          date: existingJournal.date.toISOString(),
          description: existingJournal.description,
          lampiran: existingJournal.lampiran,
          referensi: existingJournal.referensi,
          entries: existingJournal_with_entries.map(entry => ({
            id: entry.id,
            id_journal: entry.id_journal,
            id_coa: entry.id_coa,
            code_account: (entry as any).otm_id_journal ? (entry as any).otm_id_journal.code_account : '',
            debit: entry.debit,
            credit: entry.credit
          }))
        }; 
      } catch (error) {
        // === 9. Tangani error dan kembalikan pesan deskriptif ===
        throw new Error('Gagal mendapatkan detail jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}