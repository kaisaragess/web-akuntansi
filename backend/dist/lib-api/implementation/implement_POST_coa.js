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
exports.implement_POST_coa = implement_POST_coa;
const Coa_1 = require("../model/table/Coa");
function implement_POST_coa(engine) {
    engine.implement({
        endpoint: 'POST /coa',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // **Akses Data dari Skema Body:**
                //    Variabel 'data' sekarang berisi properti-properti skema yang Anda butuhkan.
                const data = param.body.data;
                const { account, code_account, jenis, description_coa, normal_balance, created_by } = data; // <-- Lakukan destructuring dari objek 'data'
                try {
                    // ... (Logika TypeORM untuk membuat entitas) ...
                    const newCoa = new Coa_1.Coa();
                    newCoa.code_account = code_account;
                    newCoa.account = account;
                    newCoa.jenis = jenis;
                    // Mapping 'description_coa' (API) ke 'description' (Model/Table)
                    newCoa.description = description_coa;
                    newCoa.normal_balance = normal_balance;
                    newCoa.created_by = created_by;
                    const savedCoa = yield newCoa.save();
                    // Kembalikan data yang disimpan dalam format COAPayload
                    const response = {
                        // id: savedCoa.id,
                        account: savedCoa.account,
                        code_account: savedCoa.code_account,
                        jenis: savedCoa.jenis,
                        // Mapping kembali 'description' (Model/Table) ke 'description_coa' (Response API)
                        description_coa: savedCoa.description,
                        normal_balance: savedCoa.normal_balance,
                        created_by: savedCoa.created_by,
                    };
                    return response;
                }
                catch (error) {
                    console.error('Error creating Coa:', error);
                    throw new Error('Gagal membuat Chart of Account (Coa) baru.');
                }
            });
        }
    });
}
