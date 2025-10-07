import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_coa_Req } from '../expressjs-aa/api/GET_coa';
import { Coa } from '../model/table/Coa';
import { verifyToken } from "../../fn/verifyToken";
import { FindOptionsOrderValue } from "typeorm";

export function implement_GET_coa(engine: ExpressAA) {
  engine.implement({
    endpoint: 'GET /coa',
    async fn(param: GET_coa_Req): Promise<Coa[]> {
    const { authorization } = param.headers;
      // 1. Otorisasi
      const user = await verifyToken(authorization);
      if (!user) {
        throw new Error("Unauthorized");
      }
    
     const { limit, page } = param.query as {
        limit?: number;
        page?: number;
      };// limit dan page adalah opsional

      // 2. Persiapan Pagination
     // KODE YANG BENAR
    const take = limit ? parseInt(limit as unknown as string, 10) : 10;
    const parsedPage = page ? parseInt(page as unknown as string, 10) : 1;
      const skip = (parsedPage - 1) * take; // Hitung offset

      // 3. Ambil data Coa
      try {
        const coaRecords = await Coa.find({
          take, // Limit
          skip,  // Offset
          order: {id: 'DESC'},
          // relations: {
          //    // Jika Anda ingin mengambil data User yang membuat Coa
          //    // Pastikan 'created_by' adalah relasi ke tabel 'User' di model Coa Anda
          //    // user: true, 
          // }
        });

        // 4. Format Respons
        // Jika tidak ada relasi, langsung mapping
        

        return coaRecords; // Kembalikan sebagai array Coa

      } catch (error) {
        console.error('Error fetching Coa records:', error);
        throw new Error('Gagal mengambil daftar Chart of Account (Coa).');
      }
    }
  });
}
