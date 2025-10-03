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
exports.Journal_Entries = void 0;
const typeorm_1 = require("typeorm");
const Journals_1 = require("../../model/table/Journals");
const Coa_1 = require("../../model/table/Coa");
let Journal_Entries = class Journal_Entries extends typeorm_1.BaseEntity {
};
exports.Journal_Entries = Journal_Entries;
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Journal_Entries.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Journals_1.Journals, x => x.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'id_journal' }),
    __metadata("design:type", Journals_1.Journals)
], Journal_Entries.prototype, "otm_id_journal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'id_journal',
        type: 'bigint',
        nullable: false,
    }),
    __metadata("design:type", Number)
], Journal_Entries.prototype, "id_journal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Coa_1.Coa, x => x.code_account, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'code_coa' }),
    __metadata("design:type", Coa_1.Coa)
], Journal_Entries.prototype, "otm_code_coa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'code_coa',
        type: 'varchar',
        nullable: false,
    }),
    __metadata("design:type", String)
], Journal_Entries.prototype, "code_coa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: false,
    }),
    __metadata("design:type", Number)
], Journal_Entries.prototype, "debit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: false,
    }),
    __metadata("design:type", Number)
], Journal_Entries.prototype, "credit", void 0);
exports.Journal_Entries = Journal_Entries = __decorate([
    (0, typeorm_1.Entity)('Journal_Entries')
], Journal_Entries);
