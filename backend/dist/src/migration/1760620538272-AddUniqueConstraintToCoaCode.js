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
exports.AddUniqueConstraintToCoaCode1760620538272 = void 0;
class AddUniqueConstraintToCoaCode1760620538272 {
    constructor() {
        this.name = 'AddUniqueConstraintToCoaCode1760620538272';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "Coa" ADD CONSTRAINT "UQ_15b3a299f1bd407d30f50bc5ef6" UNIQUE ("code_account")`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "Coa" DROP CONSTRAINT "UQ_15b3a299f1bd407d30f50bc5ef6"`);
        });
    }
}
exports.AddUniqueConstraintToCoaCode1760620538272 = AddUniqueConstraintToCoaCode1760620538272;
