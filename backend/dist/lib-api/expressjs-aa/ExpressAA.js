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
exports.ExpressAA = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Utility_1 = require("./Utility");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const POST_journals_1 = require("../expressjs-aa/api/POST_journals");
const GET_journals_1 = require("../expressjs-aa/api/GET_journals");
const GET_journals__id_1 = require("../expressjs-aa/api/GET_journals__id");
const PUT_journals__id_1 = require("../expressjs-aa/api/PUT_journals__id");
const DELETE_journals__id_1 = require("../expressjs-aa/api/DELETE_journals__id");
const POST_login_1 = require("../expressjs-aa/api/POST_login");
const POST_register_1 = require("../expressjs-aa/api/POST_register");
const POST_coa_1 = require("../expressjs-aa/api/POST_coa");
const GET_coa_1 = require("../expressjs-aa/api/GET_coa");
const GET_coa__id_1 = require("../expressjs-aa/api/GET_coa__id");
const PUT_coa__id_1 = require("../expressjs-aa/api/PUT_coa__id");
const DELETE_coa__id_1 = require("../expressjs-aa/api/DELETE_coa__id");
const classmap = {
    'POST /journals': POST_journals_1.POST_journals_Req,
    'GET /journals': GET_journals_1.GET_journals_Req,
    'GET /journals/:id': GET_journals__id_1.GET_journals__id_Req,
    'PUT /journals/:id': PUT_journals__id_1.PUT_journals__id_Req,
    'DELETE /journals/:id': DELETE_journals__id_1.DELETE_journals__id_Req,
    'POST /login': POST_login_1.POST_login_Req,
    'POST /register': POST_register_1.POST_register_Req,
    'POST /coa': POST_coa_1.POST_coa_Req,
    'GET /coa': GET_coa_1.GET_coa_Req,
    'GET /coa/:id': GET_coa__id_1.GET_coa__id_Req,
    'PUT /coa/:id': PUT_coa__id_1.PUT_coa__id_Req,
    'DELETE /coa/:id': DELETE_coa__id_1.DELETE_coa__id_Req
};
class ExpressAA {
    init(param) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (param.beforeStart) {
                yield param.beforeStart();
            }
            this.express = (0, express_1.default)();
            const port = (_b = (_a = param === null || param === void 0 ? void 0 : param.port) !== null && _a !== void 0 ? _a : process.env.PORT) !== null && _b !== void 0 ? _b : 3000;
            this.express.use((0, cors_1.default)());
            this.express.use(express_1.default.json({ limit: '5mb' }));
            this.express.set('trust proxy', true);
            this.express.listen(port, () => {
                console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
            });
            return this;
        });
    }
    errorToString(list_error) {
        return list_error.map(err => {
            const children = err.children;
            if (children && children.length > 0) {
                return this.errorToString(children);
            }
            const constrains = err.constraints;
            const keys = Object.keys(constrains);
            return keys.filter(key => constrains[key].length > 0).map(key => constrains[key]).join(', ');
        }).join(', ');
    }
    implement(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.express) {
                throw new Error('ExpressJS has not been initialized yet');
            }
            const [method, url_path] = endpoint.endpoint.toLowerCase().split(' ');
            if (method === 'post' || method === 'put' || method === 'patch' || method === 'delete' || method === 'get') {
                this.express[method](url_path, (req, res) => __awaiter(this, void 0, void 0, function* () {
                    const request_parameter = (0, class_transformer_1.plainToInstance)(classmap[method.toUpperCase() + ' ' + url_path], {
                        body: req.body,
                        headers: req.headers,
                        paths: req.params,
                        query: req.query
                    });
                    try {
                        function validPHQBName(instance) {
                            var _a;
                            return ['post', 'patch', 'put', 'get', 'delete'].includes((_a = instance === null || instance === void 0 ? void 0 : instance.constructor) === null || _a === void 0 ? void 0 : _a.name.split('_')[0].toLowerCase());
                        }
                        if (validPHQBName(request_parameter.paths)) {
                            yield (0, class_validator_1.validateOrReject)(request_parameter.paths);
                        }
                        if (validPHQBName(request_parameter.headers)) {
                            yield (0, class_validator_1.validateOrReject)(request_parameter.headers);
                        }
                        if (validPHQBName(request_parameter.query)) {
                            yield (0, class_validator_1.validateOrReject)(request_parameter.query);
                        }
                        if (validPHQBName(request_parameter.body)) {
                            yield (0, class_validator_1.validateOrReject)(request_parameter.body);
                        }
                    }
                    catch (err_validation) {
                        res.status(400).send(this.errorToString(err_validation));
                        return;
                    }
                    try {
                        const result = yield endpoint.fn({
                            body: request_parameter.body,
                            paths: request_parameter.paths,
                            headers: request_parameter.headers,
                            query: request_parameter.query
                        }, x => x);
                        res.status(200).json(result);
                    }
                    catch (err) {
                        if (err instanceof Utility_1.Utility.ErrorParam) {
                            res.status(err.code).json(err);
                            return;
                        }
                        const err_msg = err.toString();
                        if (/^s*d{3}s*:/.test(err_msg)) {
                            const [err_code, msg] = err_msg.split(':');
                            res.status(+err_code.trim()).send(msg);
                            return;
                        }
                        res.status(500).send(err_msg);
                    }
                }));
            }
            else {
                throw new Error(`Method "${method} ${url_path}" unsupported.`);
            }
        });
    }
}
exports.ExpressAA = ExpressAA;
