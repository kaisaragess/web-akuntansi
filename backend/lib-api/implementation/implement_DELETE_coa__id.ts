import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_coa__id_Req } from '../expressjs-aa/api/DELETE_coa__id';
import { Coa } from '../ts-model/table/Coa'

export function implement_DELETE_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'DELETE /coa/:id',
    async fn(param: DELETE_coa__id_Req): Promise<Coa> {
      // 
      return {} as any;
    }
  });
}
