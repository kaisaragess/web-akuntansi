import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { PUT_coa__id_Req } from '../expressjs-aa/api/PUT_coa__id';
import { COAPayload } from '../ts-schema/COAPayload'
import { Coa } from '../model/table/Coa'
import { verifyToken } from "../../fn/verifyToken";
import { error } from "console";

export function implement_PUT_coa__id(engine: ExpressAA) {
  engine.implement({
    endpoint: 'PUT /coa/:id',
    async fn(param: PUT_coa__id_Req): Promise<Coa> {
      // 
       const { authorization } = param.headers;
      if (!verifyToken(authorization)) {
        throw new Error("Unauthorized: Invalid or missing token");
      }

      // 2. Validasi Input ID
      const id = Number(param.paths.id);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new Error("Bad Request: Invalid ID format. Must be a positive integer.");
      }
      
      // 3. Validasi Payload
      const payload = param.body.data;
      if (!payload || Object.keys(payload).length === 0) {
        throw new Error("Bad Request: Missing or empty payload data");
      }

      // 4. Cari entitas di database
      const coaToUpdate = await Coa.findOneBy({ id });
      if (!coaToUpdate) {
        throw new Error("Not Found: COA record with this ID does not exist");
      }
      
      if (payload.code_account) coaToUpdate.code_account = payload.code_account;
      if (payload.account) coaToUpdate.account = payload.account;
      if (payload.jenis) coaToUpdate.jenis = payload.jenis;
      if (payload.normal_balance) coaToUpdate.normal_balance = payload.normal_balance as 'Debit' | 'Kredit';

    
      // 5. Simpan perubahan ke database
      const updatedCoa = await Coa.save(coaToUpdate);
      return updatedCoa;
    }
  });
}
