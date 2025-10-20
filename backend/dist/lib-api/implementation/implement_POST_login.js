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
const User_1 = require("../model/table/User");
const Token_1 = require("../model/table/Token");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function implement_POST_login(engine) {
    engine.implement({
        endpoint: 'POST /login',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                const { username, password } = param.body;
                const foundUser = yield User_1.User.findOne({ where: { username } });
                if (!foundUser) {
                    throw new Error("User not found");
                }
                const match = yield bcrypt_1.default.compare(password, foundUser.password);
                if (!match) {
                    throw new Error("Password doesn't match");
                }
                const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#';
                const jwtToken = jsonwebtoken_1.default.sign({
                    id: foundUser.id,
                    username: foundUser.username
                }, JWT_SECRET);
                const newToken = new Token_1.Token();
                newToken.id_user = foundUser.id;
                newToken.token = jwtToken;
                newToken.expired_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
                yield newToken.save();
                return {
                    token: jwtToken,
                    user: foundUser,
                };
            });
        }
    });
}
