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
const UserType_1 = require("../model/enum/UserType");
const User_1 = require("../model/table/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
function implement_POST_register(engine) {
    engine.implement({
        endpoint: 'POST /register',
        fn(param) {
            return __awaiter(this, void 0, void 0, function* () {
                // register user dengan  username,  password
                const { fullname, username, password } = param.body;
                if (!fullname || !username || !password) {
                    throw new Error("fullname, username, password are required");
                }
                const existingUser = yield User_1.User.findOneBy({ username });
                if (existingUser) {
                    throw new Error("username already exists");
                }
                if (password.length < 6) {
                    throw new Error("password must be at least 6 characters long");
                }
                if (username.length < 4) {
                    throw new Error("username must be at least 4 characters long");
                }
                if (fullname.length < 4) {
                    throw new Error("fullname must be at least 4 characters long");
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = new User_1.User();
                newUser.fullname = fullname;
                newUser.username = username;
                newUser.password = hashedPassword;
                newUser.role = UserType_1.UserType.user;
                newUser.created_at = new Date(Date.now());
                yield newUser.save();
                return true;
            });
        }
    });
}
