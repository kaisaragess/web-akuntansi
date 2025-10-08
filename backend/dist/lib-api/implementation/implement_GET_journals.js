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
exports.implement_GET_journals = implement_GET_journals;
const typeorm_1 = require("typeorm");
const verifyToken_1 = require("../../fn/verifyToken");
const Journals_1 = require("../model/table/Journals");
function implement_GET_journals(engine) {
    engine.implement({
        endpoint: 'GET /journals',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // 
                const { authorization } = param.headers;
                if (!(0, verifyToken_1.verifyToken)(authorization)) {
                    throw new Error("Unauthorized: Invalid or missing token");
                }
                // 2. Ambil parameter query
                const { end_date, limit = 10, page = 1, start_date } = param.query;
                const skip = (page - 1) * limit;
                // 3. Buat kondisi filter tanggal secara dinamis
                const where = {};
                if (start_date && end_date) {
                    where.date = (0, typeorm_1.Between)(new Date(start_date), new Date(end_date));
                }
                else if (start_date) {
                    where.date = (0, typeorm_1.MoreThanOrEqual)(new Date(start_date));
                }
                else if (end_date) {
                    where.date = (0, typeorm_1.LessThanOrEqual)(new Date(end_date));
                }
                // 4. Ambil data jurnal DAN entri-nya dalam satu query
                const [journals, totalCount] = yield Journals_1.Journals.findAndCount({
                    where,
                    take: limit,
                    skip,
                    order: {
                        date: 'DESC',
                        id: 'DESC'
                    },
                    // KUNCI UTAMA: Ambil relasi 'entries' secara efisien
                    // relations: {
                    //   entries: true,
                    // },
                });
                // 5. Format data sesuai dengan skema yang diinginkan
                return journals.map(journal => ({
                    id: journal.id,
                    id_user: journal.id_user,
                    nomor_bukti: journal.nomor_bukti,
                    date: journal.date.toISOString(),
                    description: journal.description,
                    lampiran: journal.lampiran,
                    referensi: journal.referensi,
                    entries: journal.entries.map((entry) => ({
                        id_coa: entry.code_coa,
                        debit: entry.debit,
                        credit: entry.credit
                    }))
                }));
            });
        }
    });
}
