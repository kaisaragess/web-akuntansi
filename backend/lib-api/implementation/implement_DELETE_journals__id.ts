import { AppDataSource } from "../../data-source";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_journals__id_Req } from '../expressjs-aa/api/DELETE_journals__id';
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_DELETE_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'DELETE /journals/:id',
    async fn(param: DELETE_journals__id_Req): Promise<JournalRes> {
      // 
      const { authorization } = param.headers;
      const authheader = await verifyToken(authorization);
      if (!authheader) {
        throw new Error("Unauthorized: Invalid token");
      }

      const { id } = param.paths;
      if (!id) {
        throw new Error("Bad Request: Missing Journal ID");
      }

      const journalToDelete = await Journals.findOneBy({ id: Number(id) });
      if (!journalToDelete) {
        throw new Error("Not Found: Journal record does not exist");
      }

       await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        // Langkah A: Cari jurnal utama
        const journalToDelete = await transactionalEntityManager.findOne(Journals, { where: { id } });
        if (!journalToDelete) {
          throw new Error("Not Found: Journal with this ID does not exist");
        }

        // Langkah B: Hapus semua Journal_Entries yang terkait terlebih dahulu
        await transactionalEntityManager.delete(Journal_Entries, { id_journal: id });

        // Langkah C: Setelah "anak"-nya hilang, baru hapus "induk"-nya
        await transactionalEntityManager.remove(Journals, journalToDelete);
      });

      
      
      return { 
        id: journalToDelete.id,
        id_user: journalToDelete.id_user,
        nomor_bukti: journalToDelete.nomor_bukti,
        date: journalToDelete.date.toISOString(),
        description: journalToDelete.description,
        lampiran: journalToDelete.lampiran,
        referensi: journalToDelete.referensi,
        entries: [] // Entries dihapus bersama jurnal, jadi dikembalikan sebagai array kosong
       };
    }
  });
}
