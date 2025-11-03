import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { GET_coa_Req } from '../expressjs-aa/api/GET_coa'; // Import tipe request untuk endpoint GET /coa
import { Coa } from '../model/table/Coa'; // Import model Coa dari database
import { verifyToken } from "../../fn/verifyToken"; // Import fungsi verifyToken untuk validasi JWT
import { FindOptionsOrderValue } from "typeorm"; // Import tipe untuk sorting data TypeORM

export function implement_GET_coa(engine: ExpressAA) {
  // Fungsi utama untuk mendaftarkan endpoint GET /coa
  engine.implement({
    endpoint: 'GET /coa', // Menentukan HTTP method dan route endpoint

    async fn(param: GET_coa_Req): Promise<Coa[]> {
      // === 1. Ambil dan verifikasi token dari header ===
      const { authorization } = param.headers;
      const user = await verifyToken(authorization); // Verifikasi JWT
      if (!user) { // Jika token tidak valid
        throw new Error("Unauthorized"); // Lempar error 401
      }

      // === 2. Ambil parameter query (limit & page) untuk pagination ===
      const { limit, page } = param.query as {
        limit?: number;
        page?: number;
      };

      // === 3. Konversi nilai limit dan page menjadi angka dengan default ===
      const take = limit ? parseInt(limit as unknown as string, 10) : 10; // Default limit = 10
      const parsedPage = page ? parseInt(page as unknown as string, 10) : 1; // Default page = 1
      const skip = (parsedPage - 1) * take; // Hitung offset berdasarkan halaman

      try {
        // === 4. Ambil data COA dari database dengan pagination dan sorting DESC ===
        const coaRecords = await Coa.find({
          take, // Jumlah data yang diambil
          skip, // Offset
          order: { id: 'DESC' } // Urutkan berdasarkan id descending
        });
        
        // === 5. Kembalikan daftar COA ke client ===
        return coaRecords; 

      } catch (error) {
        // === 6. Tangani error dan tampilkan pesan di konsol ===
        console.error('Error fetching Coa records:', error);
        throw new Error('Gagal mengambil daftar Chart of Account (Coa).'); // Lempar error ke client
      }
    }
  });
}