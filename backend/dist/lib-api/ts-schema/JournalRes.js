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
exports.JournalRes = void 0;
const Entry_1 = require("../ts-schema/Entry");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class JournalRes {
}
exports.JournalRes = JournalRes;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'id cannot be empty' }),
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseFloat(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'id must be a number (decimal)' }),
    __metadata("design:type", Number)
], JournalRes.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'id_user cannot be empty' }),
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseFloat(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'id_user must be a number (decimal)' }),
    __metadata("design:type", Number)
], JournalRes.prototype, "id_user", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'date cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'date must be a string' }),
    __metadata("design:type", String)
], JournalRes.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'description must be a string' }),
    __metadata("design:type", String)
], JournalRes.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'nomor_bukti cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'nomor_bukti must be a string' }),
    __metadata("design:type", String)
], JournalRes.prototype, "nomor_bukti", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'lampiran must be a string' }),
    __metadata("design:type", String)
], JournalRes.prototype, "lampiran", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'referensi must be a string' }),
    __metadata("design:type", String)
], JournalRes.prototype, "referensi", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'entries cannot be empty' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Entry_1.Entry),
    __metadata("design:type", Array)
], JournalRes.prototype, "entries", void 0);
