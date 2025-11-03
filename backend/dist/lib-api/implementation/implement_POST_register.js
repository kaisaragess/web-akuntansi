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
exports.implement_POST_register = implement_POST_register;
const UserType_1 = require("../model/enum/UserType"); // Import enum UserType untuk role user
const User_1 = require("../model/table/User"); // Import model User dari database
const bcrypt_1 = __importDefault(require("bcrypt")); // Import bcrypt untuk hashing password
function implement_POST_register(engine) {
    // Fungsi untuk implementasi endpoint POST /register
    engine.implement({
        endpoint: 'POST /register', // Menentukan route endpoint
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ambil fullname, username, password dari request body
                const { fullname, username, password } = param.body;
                if (!fullname || !username || !password) { // Validasi input wajib
                    throw new Error("fullname, username, password are required"); // Lempar error jika ada field kosong
                }
                const existingUser = yield User_1.User.findOneBy({ username }); // Cek apakah username sudah ada di database
                if (existingUser) { // Jika username sudah digunakan
                    throw new Error("username already exists"); // Lempar error
                }
                if (password.length < 6) { // Validasi panjang password minimal 6 karakter
                    throw new Error("password must be at least 6 characters long"); // Lempar error
                }
                if (username.length < 4) { // Validasi panjang username minimal 4 karakter
                    throw new Error("username must be at least 4 characters long"); // Lempar error
                }
                if (fullname.length < 4) { // Validasi panjang fullname minimal 4 karakter
                    throw new Error("fullname must be at least 4 characters long"); // Lempar error
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10); // Hash password dengan bcrypt, salt 10
                const newUser = new User_1.User(); // Buat instance User baru
                newUser.fullname = fullname; // Set fullname
                newUser.username = username; // Set username
                newUser.password = hashedPassword; // Set password yang sudah di-hash
                newUser.role = UserType_1.UserType.user; // Set role default sebagai user
                newUser.created_at = new Date(Date.now()); // Set tanggal pembuatan sekarang
                yield newUser.save(); // Simpan user baru ke database
                return true; // Kembalikan true jika registrasi berhasil
            });
        }
    });
}
