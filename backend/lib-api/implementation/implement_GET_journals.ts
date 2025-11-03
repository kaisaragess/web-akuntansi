import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm"; // Import helper TypeORM untuk query kondisi
import { verifyToken } from "../../fn/verifyToken"; // Import fungsi verifikasi JWT
import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { GET_journals_Req } from '../expressjs-aa/api/GET_journals'; // Import tipe request GET /journals
import { Journals } from "../model/table/Journals"; // Import model Journals dari database
import { JournalRes } from '../ts-schema/JournalRes'; // Import tipe response jurnal
import { Journal_Entries } from "../model/table/Journal_Entries"; // Import model Journal_Entries
import { Coa } from "../model/table/Coa"; // Import model Coa untuk ambil kode akun

export function implement_GET_journals(engine: ExpressAA) {
  // Fungsi utama untuk mendaftarkan endpoint GET /journals
  engine.implement({
    endpoint: 'GET /journals', // Menentukan HTTP method dan route endpoint

    async fn(param: GET_journals_Req): Promise<JournalRes[]> {
      // === 1. Verifikasi Token ===
      const { authorization } = param.headers;
      const token = await verifyToken(authorization); // Verifikasi JWT token
      if (!token) { // Jika token tidak valid
        throw new Error("Unauthorized: Invalid token or missing user ID"); // Lempar error 401
      }

      // === 2. Ambil parameter pagination dari query ===
      const { limit, page } = param.query as {
        limit?: number;
        page?: number;
      };

      // === 3. Hitung jumlah data per halaman dan offset untuk pagination ===
      const take = limit ? parseInt(limit as unknown as string, 10) : 10;
      const parsedPage = page ? parseInt(page as unknown as string, 10) : 1;
      const skip = (parsedPage - 1) * take;

      try {
        // === 4. Ambil daftar jurnal dari database dengan urutan tanggal terbaru ===
        const JournalsRecords = await Journals.find({
          where: {} as FindOptionsWhere<Journals>, 
          take,
          skip,
          order: { date: 'DESC' } 
        });

        // Array hasil akhir yang akan dikembalikan
        const result: JournalRes[] = [];

        // === 5. Iterasi setiap jurnal untuk mengambil entri terkait ===
        for (const journal of JournalsRecords) {
          const entries = await Journal_Entries.find({
            where: { id_journal: journal.id },
            relations: {"otm_id_journal": true} // Ambil relasi CoA (opsional)
          });

          // === 6. Format setiap entry agar menampilkan kode akun (CoA) ===
          const formattedEntries = await Promise.all(
            entries.map(async (entry) => {
              const coa = await Coa.findOne({ where: { id: entry.id_coa } });
              return {
                id_coa: entry.id_coa,
                code_account: coa ? coa.code_account : "",
                debit: entry.debit,
                credit: entry.credit,
              };
            })
          );

          // === 7. Susun objek jurnal lengkap dengan entries terformat ===
          result.push({
            id: journal.id, 
            id_user: journal.id_user,
            date: journal.date.toISOString().split('T')[0],
            description: journal.description || '',
            referensi: journal.referensi || '',
            lampiran: journal.lampiran || '',
            nomor_bukti: journal.nomor_bukti || '',
            entries: formattedEntries
          });
        }

        // === 8. Kembalikan seluruh daftar jurnal ===
        return result;

      } catch (error) {
        // === 9. Tangani error dengan detail pesan tambahan ===
        throw new Error('Gagal mengambil daftar jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}