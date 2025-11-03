import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { DELETE_coa__id_Req } from '../expressjs-aa/api/DELETE_coa__id';
import { Coa } from '../model/table/Coa'

export function implement_DELETE_coa__id(engine: ExpressAA) {
  // Fungsi utama untuk mendaftarkan endpoint DELETE /coa/:id
  engine.implement({
    endpoint: 'DELETE /coa/:id', // Menentukan HTTP method dan route endpoint

    async fn(param: DELETE_coa__id_Req): Promise<Coa> {
      // Ambil header Authorization dari request
      const { authorization } = param.headers;
      // Verifikasi token JWT
      const authheader = await verifyToken(authorization);
      if (!authheader) { // Jika token tidak valid
        throw new Error("Unauthorized: Invalid token"); // Lempar error 401
      }

      // Ambil parameter id dari URL
      const { id } = param.paths;
      if (!id) { // Jika ID tidak ada
        throw new Error("Bad Request: Missing COA ID"); // Lempar error 400
      }

      try {
        // Cari COA berdasarkan ID
        const CoaToDelete = await Coa.findOneBy({ id: Number(id) });

        if (!CoaToDelete) { // Jika COA tidak ditemukan
          throw new Error("Not Found: COA record does not exist"); // Lempar error 404
        }

        // Hapus COA dari database
        await Coa.remove(CoaToDelete);

        // Kembalikan data COA yang berhasil dihapus
        return CoaToDelete;

      } catch (error) { // Tangani error saat penghapusan
        throw new Error('Gagal menghapus Chart of Account (Coa).'); // Lempar error umum
      }
    }
  });
}
