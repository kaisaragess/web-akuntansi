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
exports.implement_GET_coa__id = implement_GET_coa__id;
const Coa_1 = require("../model/table/Coa");
const verifyToken_1 = require("../../fn/verifyToken");
function implement_GET_coa__id(engine) {
    // Fungsi utama untuk mendaftarkan endpoint GET /coa/:id
    engine.implement({
        endpoint: 'GET /coa/:id', // Menentukan HTTP method dan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // === 1. Ambil token dari header dan verifikasi ===
                const { authorization } = param.headers;
                const user = yield (0, verifyToken_1.verifyToken)(authorization); // Verifikasi JWT
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
                    const detailCoa = yield Coa_1.Coa.findOne({
                        where: { id: coaId }, // Filter berdasarkan ID
                    });
                    // === 4. Jika data tidak ditemukan, lempar error ===
                    if (!detailCoa) {
                        throw new Error(`Coa with id ${coaId} not found`); // Error 404
                    }
                    // === 5. Kembalikan data COA ke client ===
                    return detailCoa;
                }
                catch (error) {
                    // === 6. Tangani kesalahan database atau sistem ===
                    throw new Error('Failed to retrieve Coa details.' +
                        (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
