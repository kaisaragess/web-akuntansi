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
exports.GET_coa_Req = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GET_coa_Req_Query {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseFloat(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'limit must be a number (decimal)' }),
    __metadata("design:type", Number)
], GET_coa_Req_Query.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseFloat(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'page must be a number (decimal)' }),
    __metadata("design:type", Number)
], GET_coa_Req_Query.prototype, "page", void 0);
class GET_coa_Req_Headers {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'authorization cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'authorization must be a string' }),
    __metadata("design:type", String)
], GET_coa_Req_Headers.prototype, "authorization", void 0);
class GET_coa_Req {
}
exports.GET_coa_Req = GET_coa_Req;
__decorate([
    (0, class_transformer_1.Type)(() => GET_coa_Req_Query),
    __metadata("design:type", GET_coa_Req_Query)
], GET_coa_Req.prototype, "query", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => GET_coa_Req_Headers),
    __metadata("design:type", GET_coa_Req_Headers)
], GET_coa_Req.prototype, "headers", void 0);
