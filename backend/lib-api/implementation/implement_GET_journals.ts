import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_journals_Req } from '../expressjs-aa/api/GET_journals';
import { Journals } from "../model/table/Journals";
import { JournalRes } from '../ts-schema/JournalRes'
import { Journal_Entries } from "../model/table/Journal_Entries";

export function implement_GET_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /journals',
    async fn(param: GET_journals_Req): Promise<JournalRes[]> {
      // 

       const { authorization } = param.headers;
      if (!verifyToken(authorization)) {
        throw new Error("Unauthorized: Invalid or missing token");
      }

      // const { end_date, limit = 10, page = 1, start_date } = param.query;
      // const skip = (page - 1) * limit;

      // // 3. Buat kondisi filter tanggal secara dinamis
      // const where: FindOptionsWhere<Journals> = {};
      // if (start_date && end_date) {
      //   where.date = Between(new Date(start_date), new Date(end_date));
      // } else if (start_date) {
      //   where.date = MoreThanOrEqual(new Date(start_date));
      // } else if (end_date) {
      //   where.date = LessThanOrEqual(new Date(end_date));
      // }
      return {} as any

      
      
    }
  });
}
