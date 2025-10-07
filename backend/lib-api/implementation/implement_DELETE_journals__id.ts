import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_journals__id_Req } from '../expressjs-aa/api/DELETE_journals__id';
import { JournalRes } from '../ts-schema/JournalRes'

export function implement_DELETE_journals__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'DELETE /journals/:id',
    async fn(param: DELETE_journals__id_Req): Promise<JournalRes> {
      // 
      const { authorization } = param.headers;
      const authheader = verifyToken(authorization);
      if (!authheader) {
        throw new Error("Unauthorized: Invalid token");
      }

      const { id } = param.paths;
      if (!id) {
        throw new Error("Bad Request: Missing Journal ID");
      }

      
      
      return {} as any;
    }
  });
}
