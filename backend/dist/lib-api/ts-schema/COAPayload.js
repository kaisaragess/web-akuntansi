"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COAPayload = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class COAPayload {
}
exports.COAPayload = COAPayload;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'account cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'account must be a string' }),
    __metadata("design:type", String)
], COAPayload.prototype, "account", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'code_account cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'code_account must be a string' }),
    __metadata("design:type", String)
], COAPayload.prototype, "code_account", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'jenis cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'jenis must be a string' }),
    __metadata("design:type", String)
], COAPayload.prototype, "jenis", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'description_coa cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'description_coa must be a string' }),
    __metadata("design:type", String)
], COAPayload.prototype, "description_coa", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'normal_balance cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'normal_balance must be a string' }),
    __metadata("design:type", String)
], COAPayload.prototype, "normal_balance", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'created_by cannot be empty' }),
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseFloat(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'created_by must be a number (decimal)' }),
    __metadata("design:type", Number)
], COAPayload.prototype, "created_by", void 0);
