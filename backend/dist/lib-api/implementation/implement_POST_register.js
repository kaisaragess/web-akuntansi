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
<<<<<<< HEAD
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implement_POST_register = implement_POST_register;
const User_1 = require("../model/table/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
=======
Object.defineProperty(exports, "__esModule", { value: true });
exports.implement_POST_register = implement_POST_register;
>>>>>>> dbe8a9a2aa8ba3655cbba3c93a05f82fd33d3221
function implement_POST_register(engine) {
    engine.implement({
        endpoint: 'POST /register',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
                const { username, password, fullname, role } = param.body;
                // cek apakah username sudah dipakai
                const existing = yield User_1.User.findOne({ where: { username } });
                if (existing) {
                    return Promise.reject({
                        status: 400,
                        message: "Username sudah dipakai",
                    });
                }
                // Asumsi JWT_SECRET didefinisikan di suatu tempat (misalnya dari process.env)
                const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#';
                // hash password
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                // buat user baru
                const newUser = User_1.User.create({
                    username,
                    password: hashedPassword,
                    fullname,
                    role,
                    created_at: new Date(),
                });
                yield User_1.User.save(newUser);
                const jwtToken = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1d' });
                return {
                    token: jwtToken,
                    user: newUser
                };
            });
        },
=======
                // register user dengan  username,  password
                return {};
            });
        }
>>>>>>> dbe8a9a2aa8ba3655cbba3c93a05f82fd33d3221
    });
}
