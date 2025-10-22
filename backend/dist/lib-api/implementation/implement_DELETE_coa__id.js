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
    engine.implement({
        endpoint: 'DELETE /coa/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                const authheader = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!authheader) {
                    throw new Error("Unauthorized: Invalid token");
                }
                const { id } = param.paths;
                if (!id) {
                    throw new Error("Bad Request: Missing COA ID");
                }
                try {
                    const CoaToDelete = yield Coa_1.Coa.findOneBy({ id: Number(id) });
                    if (!CoaToDelete) {
                        throw new Error("Not Found: COA record does not exist");
                    }
                    yield Coa_1.Coa.remove(CoaToDelete);
                    return CoaToDelete;
                }
                catch (error) {
                    throw new Error('Gagal menghapus Chart of Account (Coa).');
                }
            });
        }
    });
}
