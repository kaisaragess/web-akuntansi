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
exports.Token = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../../model/table/User");
let Token = class Token extends typeorm_1.BaseEntity {
};
exports.Token = Token;
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Token.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], Token.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, x => x.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'id_user' }),
    __metadata("design:type", User_1.User)
], Token.prototype, "otm_id_user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'id_user',
        type: 'bigint',
        nullable: false,
    }),
    __metadata("design:type", Number)
], Token.prototype, "id_user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: false,
    }),
    __metadata("design:type", Date)
], Token.prototype, "expired_at", void 0);
exports.Token = Token = __decorate([
    (0, typeorm_1.Entity)('Token')
], Token);
