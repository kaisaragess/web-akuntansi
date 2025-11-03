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
exports.implement_PUT_coa__id = implement_PUT_coa__id;
const Coa_1 = require("../model/table/Coa"); // Import model Coa dari database
const verifyToken_1 = require("../../fn/verifyToken"); // Import fungsi verifyToken untuk validasi JWT
function implement_PUT_coa__id(engine) {
    // Fungsi untuk implementasi endpoint PUT /coa/:id
    engine.implement({
        endpoint: 'PUT /coa/:id', // Menentukan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers; // Ambil header authorization
                const token = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi token JWT
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
                    const coaToUpdate = yield Coa_1.Coa.findOneBy({ id }); // Cari COA yang akan diperbarui berdasarkan id
                    if (!coaToUpdate) { // Jika COA tidak ditemukan
                        throw new Error("Not Found: COA record with this ID does not exist"); // Lempar error
                    }
                    if (payload.code_account)
                        coaToUpdate.code_account = payload.code_account; // Update code_account jika ada di payload
                    if (payload.account)
                        coaToUpdate.account = payload.account; // Update account jika ada di payload
                    if (payload.jenis)
                        coaToUpdate.jenis = payload.jenis; // Update jenis jika ada di payload
                    if (payload.normal_balance)
                        coaToUpdate.normal_balance = payload.normal_balance;
                    // Update normal_balance jika ada di payload, dengan tipe Debit/Kredit
                    const updatedCoa = yield Coa_1.Coa.save(coaToUpdate); // Simpan perubahan ke database
                    return updatedCoa; // Kembalikan COA yang diperbarui
                }
                catch (error) { // Tangani error saat update
                    throw new Error('Gagal memperbarui Chart of Account (Coa).' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
