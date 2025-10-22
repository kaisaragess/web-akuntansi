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
exports.POST_login_Req = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class POST_login_Req_Body {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'username cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'username must be a string' }),
    __metadata("design:type", String)
], POST_login_Req_Body.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'password cannot be empty' }),
    (0, class_validator_1.IsString)({ message: 'password must be a string' }),
    __metadata("design:type", String)
], POST_login_Req_Body.prototype, "password", void 0);
class POST_login_Req {
}
exports.POST_login_Req = POST_login_Req;
__decorate([
    (0, class_transformer_1.Type)(() => POST_login_Req_Body),
    __metadata("design:type", POST_login_Req_Body)
], POST_login_Req.prototype, "body", void 0);
