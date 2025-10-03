import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_coa_Req } from '../expressjs-aa/api/POST_coa';
import { Coa } from "../model/table/Coa";
import { COAPayload } from '../ts-schema/COAPayload';

export function implement_POST_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /coa',
    async fn(param: POST_coa_Req): Promise<COAPayload> {
      
      // **Akses Data dari Skema Body:**
      //    Variabel 'data' sekarang berisi properti-properti skema yang Anda butuhkan.
      const data = param.body.data; 

      const { 
        account, 
        code_account, 
        jenis, 
        description_coa,
        normal_balance, 
        created_by 
      } = data; // <-- Lakukan destructuring dari objek 'data'

      try {
        // ... (Logika TypeORM untuk membuat entitas) ...
        const newCoa = new Coa();
        newCoa.code_account = code_account;
        newCoa.account = account;
        newCoa.jenis = jenis;
        
        // Mapping 'description_coa' (API) ke 'description' (Model/Table)
        newCoa.description = description_coa; 
        newCoa.normal_balance = normal_balance;
        newCoa.created_by = created_by;
        
        const savedCoa = await newCoa.save();

        // Kembalikan data yang disimpan dalam format COAPayload
        const response: COAPayload = {
          // id: savedCoa.id,
          account: savedCoa.account,
          code_account: savedCoa.code_account,
          jenis: savedCoa.jenis,
          // Mapping kembali 'description' (Model/Table) ke 'description_coa' (Response API)
          description_coa: savedCoa.description, 
          normal_balance: savedCoa.normal_balance,
          created_by: savedCoa.created_by,
        };

        return response;

      } catch (error) {
        console.error('Error creating Coa:', error);
        throw new Error('Gagal membuat Chart of Account (Coa) baru.');
      }
    }
  });
}
