import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Abstraksi Express.js
import { POST_coa_Req } from '../expressjs-aa/api/POST_coa'; // Tipe request POST /coa
import { Coa } from "../model/table/Coa"; // Model Coa ORM
import { COAPayload } from '../ts-schema/COAPayload'; // Tipe response COAPayload
import { User } from "../model/table/User"; // Jika perlu relasi created_by
import { verifyToken } from "../../fn/verifyToken"; // Fungsi verifikasi JWT
import { Token } from "../model/table/Token"; // Model Token (opsional)

export function implement_POST_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /coa', // Route endpoint

    async fn(param: POST_coa_Req): Promise<COAPayload> {
      
      // === 1. Verifikasi token ===
      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized");
      }

      // === 2. Ambil data dari request body ===
      const { 
        account, 
        code_account, 
        jenis, 
        description,
        normal_balance,  
      } = param.body.data;

      try {

        // === 3. Validasi code_account tidak duplikat ===
        const exsistingCoa = await Coa.findOne({ where: { code_account } });
        if (exsistingCoa) {
          throw new Error(`Chart of Account dengan kode ${code_account} sudah ada.`);
        }

        // === 4. Validasi panjang code_account ===
        if(code_account.length !== 3){
          throw new Error(`Kode Akun harus terdiri dari 3 karakter.`);
        }

        // === 5. Simpan data baru ke database ===
        const newCoa = new Coa();
        newCoa.code_account = code_account;
        newCoa.account = account;
        newCoa.jenis = jenis;
        newCoa.description = description; 
        newCoa.normal_balance = normal_balance;
        newCoa.created_by = token; // relasi user pembuat

        await newCoa.save();

        // === 6. Kembalikan response COAPayload ===
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