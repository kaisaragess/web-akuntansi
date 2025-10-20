import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_journals_Req } from '../expressjs-aa/api/GET_journals';
import { Journals } from "../model/table/Journals";
import { JournalRes } from '../ts-schema/JournalRes'
import { Journal_Entries } from "../model/table/Journal_Entries";
import { off } from "process";
import { Coa } from "../model/table/Coa";

export function implement_GET_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /journals',
    async fn(param: GET_journals_Req): Promise<JournalRes[]> {
      // 

      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized: Invalid token or missing user ID");
      }

      const { limit, page } = param.query as {
        limit?: number;
        page?: number;
      }
      
      // Pagination
      const take = limit ? parseInt(limit as unknown as string, 10) : 10;
      const parsedPage = page ? parseInt(page as unknown as string, 10) : 1;
      const skip = (parsedPage - 1) * take;

      try {
        const JournalsRecords = await Journals.find({
        where: {} as FindOptionsWhere<Journals>, 
        take,
        skip,
        order: { date: 'DESC' } 
      });

      const result: JournalRes[] = [];

      for (const journal of JournalsRecords) {
        const entries = await Journal_Entries.find({
          where: { id_journal: journal.id },
          relations: {"otm_id_journal": true}
        });

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
      return result;
      } catch (error) {
        throw new Error('Gagal mengambil daftar jurnal.' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}
