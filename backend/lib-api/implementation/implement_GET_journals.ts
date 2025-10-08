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

      
      return {} as any; // Placeholder, implement fetching journals if needed
    }
  });
}
