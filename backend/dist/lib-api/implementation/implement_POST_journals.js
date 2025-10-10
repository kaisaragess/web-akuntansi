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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implement_POST_journals = implement_POST_journals;
const data_source_1 = require("../../data-source");
const verifyToken_1 = require("../../fn/verifyToken");
const Journal_Entries_1 = require("../model/table/Journal_Entries");
const Journals_1 = require("../model/table/Journals");
const multer_1 = __importDefault(require("multer"));
// const uploadDir = './uploads/attachments/';
// fs.mkdirSync(uploadDir, { recursive: true });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage });
// // Asumsi HttpError sudah didefinisikan
// class HttpError extends Error {
//   constructor(public statusCode: number, message: string) {
//     super(message);
//   }
// }
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB (opsional)
});
// Asumsi HttpError sudah didefinisikan
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
function implement_POST_journals(engine) {
    engine.implement({
        endpoint: 'POST /journals',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // Verifikasi token dan dapatkan id_user
                const { authorization } = param.headers;
                const token = yield (0, verifyToken_1.verifyToken)(authorization);
                if (!token) {
                    throw new Error("Unauthorized: Invalid token or missing user ID ");
                }
                const id_user = token;
                try {
                    const { nomor_bukti, date, description, lampiran, referensi, entries } = param.body;
                    if (!nomor_bukti || !date || !entries) {
                        throw new Error("Bad Request: nomor_bukti, date, and entries are required");
                    }
                    if (!Array.isArray(entries) || entries.length === 0) {
                        throw new Error("Bad Request: entries must be a non-empty array");
                    }
                    const journalDate = new Date(date);
                    if (isNaN(journalDate.getTime())) {
                        throw new Error("Bad Request: Invalid date format");
                    }
                    // Validasi logika akuntansi
                    let totalDebit = 0;
                    let totalCredit = 0;
                    for (const entry of entries) {
                        if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
                            throw new Error("Bad Request: debit and credit in entries must be numbers");
                        }
                        totalDebit += entry.debit;
                        totalCredit += entry.credit;
                    }
                    if (totalDebit !== totalCredit) {
                        throw new Error("Bad Request: Total debit must equal total credit");
                    }
                    if (totalDebit === 0) {
                        throw new Error("Bad Request: Journal entries cannot have zero total value");
                    }
                    // upload
                    // let attachmentId: string | null = null;
                    // if (param.body.lampiran) {
                    //   attachmentId = await uploadToGoogleDrive(param.body.lampiran);
                    // }
                    // Simpan ke database menggunakan transaksi
                    const newJournal = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                        const journal = new Journals_1.Journals();
                        journal.id_user = id_user;
                        journal.date = journalDate;
                        journal.description = description;
                        journal.referensi = referensi;
                        journal.lampiran = lampiran;
                        journal.nomor_bukti = nomor_bukti;
                        yield transactionalEntityManager.save(journal);
                        const journalEntriesArray = entries.map(entry => {
                            const newEntry = new Journal_Entries_1.Journal_Entries();
                            newEntry.id_journal = journal.id; // Hubungkan entry ke jurnal yang baru dibuat
                            newEntry.code_account = entry.code_account;
                            newEntry.debit = entry.debit;
                            newEntry.credit = entry.credit;
                            return newEntry;
                        });
                        // Langkah 3: Simpan semua record entries dalam satu operasi
                        yield transactionalEntityManager.save(journalEntriesArray);
                        // Return jurnal yang baru dibuat beserta entries-nya
                        return Object.assign(Object.assign({}, journal), { entries: journalEntriesArray });
                    }));
                    return {
                        id: newJournal.id,
                        id_user: newJournal.id_user,
                        date: newJournal.date.toISOString(),
                        description: newJournal.description || '',
                        referensi: newJournal.referensi || '',
                        lampiran: newJournal.lampiran || '',
                        nomor_bukti: newJournal.nomor_bukti || '',
                        entries: newJournal.entries.map(e => ({
                            code_account: e.code_account,
                            debit: e.debit,
                            credit: e.credit
                        })),
                    };
                }
                catch (error) {
                    throw new Error('Gagal membuat jurnal baru.' + (error instanceof Error ? ' Detail: ' + error.message : ''));
                }
            });
        }
    });
}
