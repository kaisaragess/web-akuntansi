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
exports.implement_GET_coa = implement_GET_coa;
const Coa_1 = require("../model/table/Coa");
const verifyToken_1 = require("../../fn/verifyToken");
function implement_GET_coa(engine) {
    engine.implement({
        endpoint: 'GET /coa',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers;
                // 1. Otorisasi
                const user = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!user) {
                    throw new Error("Unauthorized");
                }
                const { limit, page } = param.query; // limit dan page adalah opsional
                // 2. Persiapan Pagination
                // KODE YANG BENAR
                const take = limit ? parseInt(limit, 10) : 10;
                const parsedPage = page ? parseInt(page, 10) : 1;
                const skip = (parsedPage - 1) * take; // Hitung offset
                // 3. Ambil data Coa
                try {
                    const coaRecords = yield Coa_1.Coa.find({
                        take, // Limit
                        skip, // Offset
                        order: { id: 'DESC' },
                        // relations: {
                        //    // Jika Anda ingin mengambil data User yang membuat Coa
                        //    // Pastikan 'created_by' adalah relasi ke tabel 'User' di model Coa Anda
                        //    // user: true, 
                        // }
                    });
                    // 4. Format Respons
                    // Jika tidak ada relasi, langsung mapping
                    return coaRecords; // Kembalikan sebagai array Coa
                }
                catch (error) {
                    console.error('Error fetching Coa records:', error);
                    throw new Error('Gagal mengambil daftar Chart of Account (Coa).');
                }
            });
        }
    });
}
