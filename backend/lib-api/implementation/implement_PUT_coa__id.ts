import { PUT_coa__id_Req } from '../expressjs-aa/api/PUT_coa__id';
import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { COAPayload } from '../ts-schema/COAPayload' // Import tipe payload COA
import { Coa } from '../model/table/Coa' // Import model Coa dari database
import { verifyToken } from "../../fn/verifyToken"; // Import fungsi verifyToken untuk validasi JWT
import { error } from "console"; // Import console.error (tidak digunakan, bisa dihapus tapi tetap dipertahankan)

export function implement_PUT_coa__id(engine: ExpressAA) {
  // Fungsi untuk implementasi endpoint PUT /coa/:id
  engine.implement({
    endpoint: 'PUT /coa/:id', // Menentukan route endpoint
    async fn(param: PUT_coa__id_Req): Promise<Coa> { // Fungsi handler untuk endpoint, mengembalikan Coa yang diperbarui
      const { authorization } = param.headers; // Ambil header authorization
      const token = await verifyToken(authorization); // Verifikasi token JWT
      if (!token) { // Jika token tidak valid atau tidak ada
        throw new Error("Unauthorized: Invalid or missing token"); // Lempar error
      }

      const id = Number(param.paths.id); // Ambil id dari path parameter dan konversi ke number
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) { // Validasi format id
        throw new Error("Bad Request: Invalid ID format. Must be a positive integer."); // Lempar error jika invalid
      }
      
      const payload = param.body.data; // Ambil payload data dari body request
      if (!payload || Object.keys(payload).length === 0) { // Validasi payload tidak kosong
        throw new Error("Bad Request: Missing or empty payload data"); // Lempar error jika kosong
      }

      try {
        const coaToUpdate = await Coa.findOneBy({ id }); // Cari COA yang akan diperbarui berdasarkan id
        if (!coaToUpdate) { // Jika COA tidak ditemukan
          throw new Error("Not Found: COA record with this ID does not exist"); // Lempar error
        }
        
        if (payload.code_account) coaToUpdate.code_account = payload.code_account; // Update code_account jika ada di payload
        if (payload.account) coaToUpdate.account = payload.account; // Update account jika ada di payload
        if (payload.jenis) coaToUpdate.jenis = payload.jenis; // Update jenis jika ada di payload
        if (payload.normal_balance) coaToUpdate.normal_balance = payload.normal_balance as 'Debit' | 'Kredit'; 
        // Update normal_balance jika ada di payload, dengan tipe Debit/Kredit

        const updatedCoa = await Coa.save(coaToUpdate); // Simpan perubahan ke database
        return updatedCoa; // Kembalikan COA yang diperbarui
      } catch (error) { // Tangani error saat update
        throw new Error('Gagal memperbarui Chart of Account (Coa).' + (error instanceof Error ? ' Detail: ' + error.message : '') );
      }
    }
  });
}