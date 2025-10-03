import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_coa_Req } from '../expressjs-aa/api/POST_coa';
import { COAPayload } from '../ts-schema/COAPayload'
import { COAPayload } from '../ts-schema/COAPayload'

export function implement_POST_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /coa',
    async fn(param: POST_coa_Req): Promise<COAPayload> {
      // 
      return {} as any;
    }
  });
}
