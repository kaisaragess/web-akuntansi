"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const typeorm_1 = require("typeorm");
console.log('--- MEMERIKSA VARIABEL ENV UNTUK DATABASE ---');
console.log('USERNAME:', process.env.PAGONILA_USERNAME);
console.log('PASSWORD:', process.env.PASSWORD ? '****** (ada isinya)' : undefined); // Jangan log password asli
console.log('HOST:', process.env.HOST);
console.log('DATABASE:', process.env.DATABASE);
console.log('-------------------------------------------');
const config = {
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.PORT),
    username: process.env.PAGONILA_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE, // <-- nama database
    synchronize: false,
    logging: false,
    migrations: [
        __dirname + '/migration/**.ts' // <-- path "migration" akan dijadikan acuan lokasi untuk men-generate migration database
    ],
    entities: [
        __dirname + '/lib-api/model/**/*.{ts,js}' // <-- "lib-api" = nama sesuai output keluaran generator kode
    ]
};
exports.AppDataSource = new typeorm_1.DataSource(config);
