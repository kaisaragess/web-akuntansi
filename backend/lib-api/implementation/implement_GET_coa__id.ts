import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_coa__id_Req } from '../expressjs-aa/api/GET_coa__id';
import { Coa } from '../ts-model/table/Coa'

export function implement_GET_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /coa/:id',
    async fn(param: GET_coa__id_Req): Promise<Coa> {
      // 
      return {} as any;
    }
  });
}
