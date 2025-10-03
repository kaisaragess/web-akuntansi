import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_journals_Req } from '../expressjs-aa/api/GET_journals';
import { getJournals } from '../ts-schema/getJournals'

export function implement_GET_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /journals',
    async fn(param: GET_journals_Req): Promise<getJournals[]> {
      // 
      return {} as any;
    }
  });
}
