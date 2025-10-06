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
exports.Journals = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../../model/table/User");
let Journals = class Journals extends typeorm_1.BaseEntity {
};
exports.Journals = Journals;
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Journals.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, x => x.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'id_user' }),
    __metadata("design:type", User_1.User)
], Journals.prototype, "otm_id_user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'id_user',
        type: 'bigint',
        nullable: false,
    }),
    __metadata("design:type", Number)
], Journals.prototype, "id_user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: false,
    }),
    __metadata("design:type", Date)
], Journals.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Journals.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Journals.prototype, "referensi", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Journals.prototype, "lampiran", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], Journals.prototype, "nomor_bukti", void 0);
exports.Journals = Journals = __decorate([
    (0, typeorm_1.Entity)('Journals')
], Journals);
