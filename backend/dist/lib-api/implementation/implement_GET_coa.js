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
const Coa_1 = require("../model/table/Coa"); // Import model Coa dari database
const verifyToken_1 = require("../../fn/verifyToken"); // Import fungsi verifyToken untuk validasi JWT
function implement_GET_coa(engine) {
    // Fungsi utama untuk mendaftarkan endpoint GET /coa
    engine.implement({
        endpoint: 'GET /coa', // Menentukan HTTP method dan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // === 1. Ambil dan verifikasi token dari header ===
                const { authorization } = param.headers;
                const user = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi JWT
                if (!user) { // Jika token tidak valid
                    throw new Error("Unauthorized"); // Lempar error 401
                }
                // === 2. Ambil parameter query (limit & page) untuk pagination ===
                const { limit, page } = param.query;
                // === 3. Konversi nilai limit dan page menjadi angka dengan default ===
                const take = limit ? parseInt(limit, 10) : 10; // Default limit = 10
                const parsedPage = page ? parseInt(page, 10) : 1; // Default page = 1
                const skip = (parsedPage - 1) * take; // Hitung offset berdasarkan halaman
                try {
                    // === 4. Ambil data COA dari database dengan pagination dan sorting DESC ===
                    const coaRecords = yield Coa_1.Coa.find({
                        take, // Jumlah data yang diambil
                        skip, // Offset
                        order: { id: 'DESC' } // Urutkan berdasarkan id descending
                    });
                    // === 5. Kembalikan daftar COA ke client ===
                    return coaRecords;
                }
                catch (error) {
                    // === 6. Tangani error dan tampilkan pesan di konsol ===
                    console.error('Error fetching Coa records:', error);
                    throw new Error('Gagal mengambil daftar Chart of Account (Coa).'); // Lempar error ke client
                }
            });
        }
    });
}
