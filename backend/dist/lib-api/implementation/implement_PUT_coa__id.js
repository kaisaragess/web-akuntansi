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
const Coa_1 = require("../model/table/Coa");
const verifyToken_1 = require("../../fn/verifyToken");
function implement_PUT_coa__id(engine) {
    engine.implement({
        endpoint: 'PUT /coa/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                if (!(0, verifyToken_1.verifyToken)(authorization)) {
                    throw new Error("Unauthorized: Invalid or missing token");
                }
                // 2. Validasi Input ID
                const id = Number(param.paths.id);
                if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
                    throw new Error("Bad Request: Invalid ID format. Must be a positive integer.");
                }
                // 3. Validasi Payload
                const payload = param.body.data;
                if (!payload || Object.keys(payload).length === 0) {
                    throw new Error("Bad Request: Missing or empty payload data");
                }
                // 4. Cari entitas di database
                const coaToUpdate = yield Coa_1.Coa.findOneBy({ id });
                if (!coaToUpdate) {
                    throw new Error("Not Found: COA record with this ID does not exist");
                }
                if (payload.code_account)
                    coaToUpdate.code_account = payload.code_account;
                if (payload.account)
                    coaToUpdate.account = payload.account;
                if (payload.jenis)
                    coaToUpdate.jenis = payload.jenis;
                if (payload.normal_balance)
                    coaToUpdate.normal_balance = payload.normal_balance;
                // 5. Simpan perubahan ke database
                const updatedCoa = yield Coa_1.Coa.save(coaToUpdate);
                return updatedCoa;
            });
        }
    });
}
