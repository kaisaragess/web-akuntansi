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
    engine.implement({
        endpoint: 'GET /coa/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { authorization } = param.headers;
                const user = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!user) {
                    throw new Error("Unauthorized");
                }
                const coaId = param.paths.id;
                if (!coaId) {
                    throw new Error("Bad Request: Missing Coa ID");
                }
                try {
                    const detailCoa = yield Coa_1.Coa.findOne({
                        where: { id: coaId },
                    });
                    if (!detailCoa) {
                        throw new Error(`Coa with id ${coaId} not found`);
                    }
                    return detailCoa;
                }
                catch (error) {
                    throw new Error('Failed to retrieve Coa details.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
