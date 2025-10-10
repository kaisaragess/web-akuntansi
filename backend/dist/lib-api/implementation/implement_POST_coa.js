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
const Token_1 = require("../model/table/Token");
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
                if (!Token_1.Token) { // Pengecekan keamanan
                    throw new Error("Unauthorized: Invalid token or missing user ID");
                }
<<<<<<< HEAD
                const tokenString = authorization.split(' ')[1];
                const tokenRecord = yield Token_1.Token.findOneBy({
                    token: tokenString,
                });
                if (!tokenRecord) {
                    throw new Error("Unauthorized: Token not found");
                }
                const id_user = tokenRecord.id_user;
=======
>>>>>>> 487b8c74a18ea7d1641d621ef14edfd600a85697
                const { account, code_account, jenis, description, normal_balance, } = param.body.data; // <-- Lakukan destructuring dari objek 'data'
                try {
                    const newCoa = new Coa_1.Coa();
                    newCoa.code_account = code_account;
                    newCoa.account = account;
                    newCoa.jenis = jenis;
                    newCoa.description = description;
                    newCoa.normal_balance = normal_balance;
<<<<<<< HEAD
                    // newCoa.created_by = id_user;
=======
                    newCoa.created_by = token;
>>>>>>> 487b8c74a18ea7d1641d621ef14edfd600a85697
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
                    console.error('Error creating Coa:', error);
                    throw new Error('Gagal membuat Chart of Account (Coa) baru.');
                }
            });
        }
    });
}
