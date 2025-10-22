import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_coa__id_Req } from '../expressjs-aa/api/DELETE_coa__id';
import { Coa } from '../model/table/Coa'

export function implement_DELETE_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'DELETE /coa/:id',
    async fn(param: DELETE_coa__id_Req): Promise<Coa> {
      // 
      
      const { authorization } = param.headers;
      const authheader = await verifyToken(authorization);
      if (!authheader) {
        throw new Error("Unauthorized: Invalid token");
      }

      const { id } = param.paths;
      if (!id) {
        throw new Error("Bad Request: Missing COA ID");
      }

      try {
          const CoaToDelete = await Coa.findOneBy({ id: Number(id) });
          if (!CoaToDelete) {
              throw new Error("Not Found: COA record does not exist");
          }

          await Coa.remove(CoaToDelete);
      
          return CoaToDelete;
      } catch (error) {
        throw new Error('Gagal menghapus Chart of Account (Coa).');
      }
    }
  });
}
