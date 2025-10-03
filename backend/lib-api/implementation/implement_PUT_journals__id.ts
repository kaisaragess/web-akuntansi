import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { PUT_journals__id_Req } from '../expressjs-aa/api/PUT_journals__id';
import { Entry } from '../ts-schema/Entry'
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_PUT_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'PUT /journals/:id',
    async fn(param: PUT_journals__id_Req): Promise<JournalRes> {
      // 
      return {} as any;
    }
  });
}
