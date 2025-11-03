import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { GET_coa__id_Req } from '../expressjs-aa/api/GET_coa__id';
import { Coa } from '../model/table/Coa';
import { verifyToken } from "../../fn/verifyToken";

export function implement_GET_coa__id(engine: ExpressAA) {
// Fungsi utama untuk mendaftarkan endpoint GET /coa/:id
  engine.implement({
    endpoint: 'GET /coa/:id', // Menentukan HTTP method dan route endpoint

    async fn(param: GET_coa__id_Req): Promise<Coa> {
      // === 1. Ambil token dari header dan verifikasi ===
      const { authorization } = param.headers;
      const user = await verifyToken(authorization); // Verifikasi JWT
      if (!user) { // Jika token tidak valid
        throw new Error("Unauthorized"); // Lempar error 401
      }

      // === 2. Ambil parameter ID dari URL ===
      const coaId = param.paths.id;
      if (!coaId) { // Jika ID tidak diberikan
        throw new Error("Bad Request: Missing Coa ID"); // Lempar error 400
      }

      try {
        // === 3. Ambil data COA dari database berdasarkan ID ===
        const detailCoa = await Coa.findOne({
          where: { id: coaId }, // Filter berdasarkan ID
        });

        // === 4. Jika data tidak ditemukan, lempar error ===
        if (!detailCoa) {
          throw new Error(`Coa with id ${coaId} not found`); // Error 404
        }

        // === 5. Kembalikan data COA ke client ===
        return detailCoa;

      } catch (error) {
        // === 6. Tangani kesalahan database atau sistem ===
        throw new Error(
          'Failed to retrieve Coa details.' +
          (error instanceof Error ? ' Detail: ' + error.message : '')
        );
      }
    }
  });
}