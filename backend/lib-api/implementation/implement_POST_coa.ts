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
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error("Header tidak valid atau hilang");
      }
      const tokenString = authorization.split(' ')[1];
    
      const tokenRecord = await Token.findOneBy({
        token: tokenString,
      });

      if (!tokenRecord) {
       throw new Error("Unauthorized: Token not found");
      }

      const id_user = tokenRecord.id_user;

      // const userId = await Token.findOneBy({ }); // Gunakan ID user yang terverifikasi
      const { 
        account, 
        code_account, 
        jenis, 
        description_coa,
        normal_balance, 
        created_by // Ganti nama untuk menghindari konflik 
      } = param.body.data; // <-- Lakukan destructuring dari objek 'data'

      try {
        // ... (Logika TypeORM untuk membuat entitas) ...
        const newCoa = new Coa();
        newCoa.code_account = code_account;
        newCoa.account = account;
        newCoa.jenis = jenis;
        
        // Mapping 'description_coa' (API) ke 'description' (Model/Table)
        newCoa.description = description_coa; 
        newCoa.normal_balance = normal_balance;
        newCoa.created_by = id_user;
        
        const savedCoa = await newCoa.save();

        // Kembalikan data yang disimpan dalam format COAPayload
        // const response: COAPayload = {
        //   // id: savedCoa.id,
        //   account: savedCoa.account,
        //   code_account: savedCoa.code_account,
        //   jenis: savedCoa.jenis,
        //   // Mapping kembali 'description' (Model/Table) ke 'description_coa' (Response API)
        //   description_coa: savedCoa.description, 
        //   normal_balance: savedCoa.normal_balance,
        //   created_by: savedCoa.created_by,
        // };

        return {
          // id: savedCoa.id,
          account: savedCoa.account,
          code_account: savedCoa.code_account,
          jenis: savedCoa.jenis,
          // Mapping kembali 'description' (Model/Table) ke 'description_coa' (Response API)
          description_coa: savedCoa.description, 
          normal_balance: savedCoa.normal_balance,
          created_by: savedCoa.created_by,
        };

      } catch (error) {
        console.error('Error creating Coa:', error);
        throw new Error('Gagal membuat Chart of Account (Coa) baru.');
      }
    }
  });
}
