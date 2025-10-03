import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_journals__id_Req } from '../expressjs-aa/api/DELETE_journals__id';
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_DELETE_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'DELETE /journals/:id',
    async fn(param: DELETE_journals__id_Req): Promise<JournalRes> {
      // 
      return {} as any;
    }
  });
}
