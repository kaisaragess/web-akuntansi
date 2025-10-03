import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_journals__id_Req } from '../expressjs-aa/api/GET_journals__id';
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_GET_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /journals/:id',
    async fn(param: GET_journals__id_Req): Promise<JournalRes> {
      // 
      return {} as any;
    }
  });
}
