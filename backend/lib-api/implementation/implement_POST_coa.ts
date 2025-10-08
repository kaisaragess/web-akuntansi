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
      const user = await verifyToken(authorization);
      if (!user) {
        throw new Error("Unauthorized");
      }
      if (!Token) { // Pengecekan keamanan
        throw new Error("Unauthorized: Invalid token or missing user ID");
      }
      
  
      const tokenString = authorization.split(' ')[1];
    
      const tokenRecord = await Token.findOneBy({
        token: tokenString,
      });

      if (!tokenRecord) {
       throw new Error("Unauthorized: Token not found");
      }

      const id_user = tokenRecord.id_user;

      const { 
        account, 
        code_account, 
        jenis, 
        description,
        normal_balance
      } = param.body.data; // <-- Lakukan destructuring dari objek 'data'

      try {
        const newCoa = new Coa();
        newCoa.code_account = code_account;
        newCoa.account = account;
        newCoa.jenis = jenis;
        newCoa.description = description; 
        newCoa.normal_balance = normal_balance;
        newCoa.created_by = id_user;
        
        await newCoa.save();

        return {
          account,
          code_account,
          jenis,
          description, 
          normal_balance
        };

      } catch (error) {
        console.error('Error creating Coa:', error);
        throw new Error('Gagal membuat Chart of Account (Coa) baru.');
      }
    }
  });
}
