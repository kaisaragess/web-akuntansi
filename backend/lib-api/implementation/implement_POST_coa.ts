import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_coa_Req } from '../expressjs-aa/api/POST_coa';
import { Coa } from "../model/table/Coa";
import { COAPayload } from '../ts-schema/COAPayload';
import { User } from "../model/table/User"; // Jika perlu relasi created_by
import { verifyToken } from "../../fn/verifyToken";
import { Token } from "../model/table/Token";

export function implement_POST_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /coa',
    async fn(param: POST_coa_Req): Promise<COAPayload> {
      
      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized");
      }

      const { 
        account, 
        code_account, 
        jenis, 
        description,
        normal_balance,  
      } = param.body.data; // <-- Lakukan destructuring dari objek 'data'

      try {

        const exsistingCoa = await Coa.findOne({ where: { code_account } });
        if (exsistingCoa) {
          throw new Error(`Chart of Account dengan kode ${code_account} sudah ada.`);
        }

        if(code_account.length !== 3){
          throw new Error(`Kode Akun harus terdiri dari 3 karakter.`);
        }


        const newCoa = new Coa();
        newCoa.code_account = code_account;
        newCoa.account = account;
        newCoa.jenis = jenis;
        newCoa.description = description; 
        newCoa.normal_balance = normal_balance;
        newCoa.created_by = token;

        
        await newCoa.save();

        return {
          account,
          code_account,
          jenis,
          description, 
          normal_balance
        };

      } catch (error) {

        if (error instanceof Error) {
            throw error; 
        }
        throw new Error('Gagal membuat Chart of Account (Coa) baru.');
      }
    }
  });
}
