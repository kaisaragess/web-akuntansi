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
exports.User = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class User {
}
exports.User = User;
__decorate([
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : parseInt(param.value)),
    (0, class_validator_1.IsNumber)({}, { message: 'id must be a number (integer)' }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'fullname must be a string' }),
    __metadata("design:type", String)
], User.prototype, "fullname", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'username must be a string' }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'password must be a string' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'role must be a string' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, class_transformer_1.Transform)((param) => ((param === null || param === void 0 ? void 0 : param.value) === null || (param === null || param === void 0 ? void 0 : param.value) === undefined || (param === null || param === void 0 ? void 0 : param.value) === '') ? null : new Date(param === null || param === void 0 ? void 0 : param.value)),
    (0, class_validator_1.IsISO8601)({}, { message: 'created_at must be an ISO8601 date' }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
