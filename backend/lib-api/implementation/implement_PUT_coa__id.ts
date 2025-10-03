import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { PUT_coa__id_Req } from '../expressjs-aa/api/PUT_coa__id';
import { COAPayload } from '../ts-schema/COAPayload'
import { Coa } from '../ts-model/table/Coa'

export function implement_PUT_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'PUT /coa/:id',
    async fn(param: PUT_coa__id_Req): Promise<Coa> {
      // 
      return {} as any;
    }
  });
}
