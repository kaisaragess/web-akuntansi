"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implement_DELETE_coa__id = implement_DELETE_coa__id;
const verifyToken_1 = require("../../fn/verifyToken");
const Coa_1 = require("../model/table/Coa");
function implement_DELETE_coa__id(engine) {
    // Fungsi utama untuk mendaftarkan endpoint DELETE /coa/:id
    engine.implement({
        endpoint: 'DELETE /coa/:id', // Menentukan HTTP method dan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ambil header Authorization dari request
                const { authorization } = param.headers;
                // Verifikasi token JWT
                const authheader = yield (0, verifyToken_1.verifyToken)(authorization);
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
                    const CoaToDelete = yield Coa_1.Coa.findOneBy({ id: Number(id) });
                    if (!CoaToDelete) { // Jika COA tidak ditemukan
                        throw new Error("Not Found: COA record does not exist"); // Lempar error 404
                    }
                    // Hapus COA dari database
                    yield Coa_1.Coa.remove(CoaToDelete);
                    // Kembalikan data COA yang berhasil dihapus
                    return CoaToDelete;
                }
                catch (error) { // Tangani error saat penghapusan
                    throw new Error('Gagal menghapus Chart of Account (Coa).'); // Lempar error umum
                }
            });
        }
    });
}
