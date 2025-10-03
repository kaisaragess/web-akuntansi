import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_coa_Req } from '../expressjs-aa/api/GET_coa';
import { Coa } from '../ts-model/table/Coa'

export function implement_GET_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /coa',
    async fn(param: GET_coa_Req): Promise<Coa[]> {
      // 
      return {} as any;
    }
  });
}
