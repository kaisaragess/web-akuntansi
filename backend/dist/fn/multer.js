"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Konfigurasi penyimpanan untuk Multer
const storage = multer_1.default.diskStorage({
    // Tentukan folder tujuan untuk menyimpan file
    destination: function (req, file, cb) {
        cb(null, './uploads/attachments/'); // Pastikan folder ini ada
    },
    // Tentukan nama file untuk menghindari nama yang sama
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
