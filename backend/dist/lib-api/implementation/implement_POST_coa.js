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
const verifyToken_1 = require("../../fn/verifyToken");
function implement_POST_coa(engine) {
    engine.implement({
        endpoint: 'POST /coa',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) {
                    throw new Error("Unauthorized");
                }
                const { account, code_account, jenis, description, normal_balance, } = param.body.data; // <-- Lakukan destructuring dari objek 'data'
                try {
                    const exsistingCoa = yield Coa_1.Coa.findOne({ where: { code_account } });
                    if (exsistingCoa) {
                        throw new Error(`Chart of Account dengan kode ${code_account} sudah ada.`);
                    }
                    if (code_account.length !== 3) {
                        throw new Error(`Kode Akun harus terdiri dari 3 karakter.`);
                    }
                    const newCoa = new Coa_1.Coa();
                    newCoa.code_account = code_account;
                    newCoa.account = account;
                    newCoa.jenis = jenis;
                    newCoa.description = description;
                    newCoa.normal_balance = normal_balance;
                    newCoa.created_by = token;
                    yield newCoa.save();
                    return {
                        account,
                        code_account,
                        jenis,
                        description,
                        normal_balance
                    };
                }
                catch (error) {
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error('Gagal membuat Chart of Account (Coa) baru.');
                }
            });
        }
    });
}
