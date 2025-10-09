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
exports.implement_DELETE_journals__id = implement_DELETE_journals__id;
const data_source_1 = require("../../data-source");
const verifyToken_1 = require("../../fn/verifyToken");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
function implement_DELETE_journals__id(engine) {
    engine.implement({
        endpoint: 'DELETE /journals/:id',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                const authheader = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!authheader) {
                    throw new Error("Unauthorized: Invalid token");
                }
                const { id } = param.paths;
                if (!id) {
                    throw new Error("Bad Request: Missing Journal ID");
                }
                const journalToDelete = yield Journals_1.Journals.findOneBy({ id: Number(id) });
                if (!journalToDelete) {
                    throw new Error("Not Found: Journal record does not exist");
                }
                yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    // Langkah A: Cari jurnal utama
                    const journalToDelete = yield transactionalEntityManager.findOne(Journals_1.Journals, { where: { id } });
                    if (!journalToDelete) {
                        throw new Error("Not Found: Journal with this ID does not exist");
                    }
                    // Langkah B: Hapus semua Journal_Entries yang terkait terlebih dahulu
                    yield transactionalEntityManager.delete(Journal_Entries_1.Journal_Entries, { id_journal: id });
                    // Langkah C: Setelah "anak"-nya hilang, baru hapus "induk"-nya
                    yield transactionalEntityManager.remove(Journals_1.Journals, journalToDelete);
                }));
                return {
                    id: journalToDelete.id,
                    id_user: journalToDelete.id_user,
                    nomor_bukti: journalToDelete.nomor_bukti,
                    date: journalToDelete.date.toISOString(),
                    description: journalToDelete.description,
                    lampiran: journalToDelete.lampiran,
                    referensi: journalToDelete.referensi,
                    entries: [] // Entries dihapus bersama jurnal, jadi dikembalikan sebagai array kosong
                };
            });
        }
    });
}
