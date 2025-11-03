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
exports.implement_POST_login = implement_POST_login;
const User_1 = require("../model/table/User"); // Import model User dari database
const Token_1 = require("../model/table/Token"); // Import model Token untuk menyimpan JWT
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import library jsonwebtoken untuk membuat token
const bcrypt_1 = __importDefault(require("bcrypt")); // Import bcrypt untuk validasi password
function implement_POST_login(engine) {
    // Fungsi untuk implementasi endpoint POST /login
    engine.implement({
        endpoint: 'POST /login', // Menentukan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { username, password } = param.body; // Ambil username dan password dari request body
                const foundUser = yield User_1.User.findOne({ where: { username } }); // Cari user berdasarkan username
                if (!foundUser) { // Jika user tidak ditemukan
                    throw new Error("Username atau Password doesn't match"); // Lempar error
                }
                const match = yield bcrypt_1.default.compare(password, foundUser.password); // Bandingkan password plaintext dengan hash di DB
                if (!match) { // Jika password tidak cocok
                    throw new Error("Username atau Password doesn't match"); // Lempar error
                }
                const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#';
                // Ambil secret JWT dari env, jika tidak ada pakai default aman
                const jwtToken = jsonwebtoken_1.default.sign({
                    id: foundUser.id,
                    username: foundUser.username
                }, JWT_SECRET); // Buat JWT token dengan payload user
                const newToken = new Token_1.Token(); // Buat instance Token baru
                newToken.id_user = foundUser.id; // Set user ID pemilik token
                newToken.token = jwtToken; // Set token yang baru dibuat
                newToken.expired_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expired 24 jam dari sekarang
                yield newToken.save(); // Simpan token ke database
                return {
                    token: jwtToken, // Kembalikan JWT token
                    user: foundUser, // Kembalikan data user
                };
            });
        }
    });
}
