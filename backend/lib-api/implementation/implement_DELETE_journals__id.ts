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
      
      try {
               const journalToDelete = await Journals.findOneBy({ id: Number(id) });
                if (!journalToDelete) {
                  throw new Error("Not Found: Journal record does not exist");
                }

                await AppDataSource.manager.transaction(async (transactionalEntityManager) => {

                  const journalToDelete = await transactionalEntityManager.findOne(Journals, { where: { id } });
                  if (!journalToDelete) {
                    throw new Error("Not Found: Journal with this ID does not exist");
                  }

                  await transactionalEntityManager.delete(Journal_Entries, { id_journal: id });

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
              entries: [] 
            };
      } catch (error) {
        throw new Error('Gagal menghapus jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}










