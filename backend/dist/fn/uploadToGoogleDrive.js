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
exports.uploadToGoogleDrive = uploadToGoogleDrive;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
// Fungsi untuk meng-upload file ke Google Drive
function uploadToGoogleDrive(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const KEY_FILE_PATH = '../config/boxwood-pillar-474609-h6-cdbb18b7251d.json'; // Ganti dengan path file JSON Anda
        const FOLDER_ID = '1KNNpi0k952-f0kXC0IsYgxakQ_GuKiS4'; // Ganti dengan ID folder dari Langkah 2
        // Otentikasi
        const auth = new googleapis_1.google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const driveService = googleapis_1.google.drive({ version: 'v3', auth });
        // Metadata file
        const fileMetadata = {
            name: file.originalname,
            parents: [FOLDER_ID],
        };
        // Media yang akan di-upload
        const media = {
            mimeType: file.mimetype,
            body: stream_1.Readable.from(file.buffer), // Ubah buffer menjadi stream
        };
        // Kirim request untuk membuat file
        const response = yield driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id', // Minta agar API mengembalikan ID file yang baru dibuat
        });
        return response.data.id; // Kembalikan ID file di Google Drive
    });
}
