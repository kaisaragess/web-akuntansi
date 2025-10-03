import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_journals_Req } from '../expressjs-aa/api/POST_journals';
import { Entry } from '../ts-schema/Entry'
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_POST_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /journals',
    async fn(param: POST_journals_Req): Promise<JournalRes> {
      // 
      return {} as any;
    }
  });
}
