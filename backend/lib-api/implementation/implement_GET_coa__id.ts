import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_coa__id_Req } from '../expressjs-aa/api/GET_coa__id';
import { Coa } from '../model/table/Coa';
import { verifyToken } from "../../fn/verifyToken";

export function implement_GET_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /coa/:id',
    async fn(param: GET_coa__id_Req): Promise<Coa> {
       const { authorization } = param.headers;
       const user = await verifyToken(authorization);
      if (!user) {
        throw new Error("Unauthorized");
      }
      const coaId = param.paths.id;
      const detailCoa = await Coa.findOne({
        where: { id: coaId },
      });

      if (!detailCoa) {
        throw new Error(`Coa with id ${coaId} not found`);
      }

      return detailCoa; // Kembalikan detail Coa yang ditemukan
    }
  });
}
