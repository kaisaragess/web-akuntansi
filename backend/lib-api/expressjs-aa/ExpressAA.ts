import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Utility } from './Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator"
import { POST_journals } from '../expressjs-aa/api/POST_journals';
import { GET_journals } from '../expressjs-aa/api/GET_journals';
import { GET_journals__id } from '../expressjs-aa/api/GET_journals__id';
import { PUT_journals__id } from '../expressjs-aa/api/PUT_journals__id';
import { DELETE_journals__id } from '../expressjs-aa/api/DELETE_journals__id';
import { POST_login } from '../expressjs-aa/api/POST_login';
import { POST_register } from '../expressjs-aa/api/POST_register';
import { POST_coa } from '../expressjs-aa/api/POST_coa';
import { GET_coa } from '../expressjs-aa/api/GET_coa';
import { GET_coa__id } from '../expressjs-aa/api/GET_coa__id';
import { PUT_coa__id } from '../expressjs-aa/api/PUT_coa__id';
import { DELETE_coa__id } from '../expressjs-aa/api/DELETE_coa__id';
import { POST_journals_Req } from '../expressjs-aa/api/POST_journals';
import { GET_journals_Req } from '../expressjs-aa/api/GET_journals';
import { GET_journals__id_Req } from '../expressjs-aa/api/GET_journals__id';
import { PUT_journals__id_Req } from '../expressjs-aa/api/PUT_journals__id';
import { DELETE_journals__id_Req } from '../expressjs-aa/api/DELETE_journals__id';
import { POST_login_Req } from '../expressjs-aa/api/POST_login';
import { POST_register_Req } from '../expressjs-aa/api/POST_register';
import { POST_coa_Req } from '../expressjs-aa/api/POST_coa';
import { GET_coa_Req } from '../expressjs-aa/api/GET_coa';
import { GET_coa__id_Req } from '../expressjs-aa/api/GET_coa__id';
import { PUT_coa__id_Req } from '../expressjs-aa/api/PUT_coa__id';
import { DELETE_coa__id_Req } from '../expressjs-aa/api/DELETE_coa__id';

type Endpoints = POST_journals
  | GET_journals
  | GET_journals__id
  | PUT_journals__id
  | DELETE_journals__id
  | POST_login
  | POST_register
  | POST_coa
  | GET_coa
  | GET_coa__id
  | PUT_coa__id
  | DELETE_coa__id;
const classmap: any = {
  'POST /journals': POST_journals_Req,
  'GET /journals': GET_journals_Req,
  'GET /journals/:id': GET_journals__id_Req,
  'PUT /journals/:id': PUT_journals__id_Req,
  'DELETE /journals/:id': DELETE_journals__id_Req,
  'POST /login': POST_login_Req,
  'POST /register': POST_register_Req,
  'POST /coa': POST_coa_Req,
  'GET /coa': GET_coa_Req,
  'GET /coa/:id': GET_coa__id_Req,
  'PUT /coa/:id': PUT_coa__id_Req,
  'DELETE /coa/:id': DELETE_coa__id_Req
}

export interface SystemParam {
  port?: number
  beforeStart?(): Promise<void>
}

export class ExpressAA {
  public express?: Express;

  public async init(param: SystemParam): Promise<ExpressAA> {
    if (param.beforeStart) {
      await param.beforeStart();
    }
    
    this.express = express();
    const port = param?.port ?? process.env.PORT ?? 3000;
    
    this.express.use(cors());
    this.express.use(express.json({limit: '5mb'}));
    this.express.set('trust proxy', true);
    this.express.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
    
    return this;
  }

  private errorToString(list_error: ValidationError[]): string {
    return list_error.map(err => {
      const children: ValidationError[] | undefined = err.children;
      if (children && children.length > 0) {
        return this.errorToString(children);
      }
      const constrains: any = err.constraints;
      const keys = Object.keys(constrains);
      return keys.filter(key => constrains[key].length > 0).map(key => constrains[key]).join(', ');
    }).join(', ');
  }

  public async implement(endpoint: Endpoints) {
    if (!this.express) {
      throw new Error('ExpressJS has not been initialized yet');
    }

    const [method, url_path] = endpoint.endpoint.toLowerCase().split(' ');
    if (method === 'post' || method === 'put' || method === 'patch' || method === 'delete' || method === 'get') {
      this.express[method](url_path, async (req: Request, res: Response) => {

        const request_parameter: any = plainToInstance(classmap[method.toUpperCase() + ' ' + url_path], {
          body: req.body,
          headers: req.headers,
          paths: req.params,
          query: req.query
        });
        
        try {
          function validPHQBName(instance?: any) {
            return ['post', 'patch', 'put', 'get', 'delete'].includes(instance?.constructor?.name.split('_')[0].toLowerCase());
          }

          if (validPHQBName(request_parameter.paths)) {
            await validateOrReject(request_parameter.paths);
          }
          if (validPHQBName(request_parameter.headers)) {
            await validateOrReject(request_parameter.headers);
          }
          if (validPHQBName(request_parameter.query)) {
            await validateOrReject(request_parameter.query);
          }
          if (validPHQBName(request_parameter.body)) {
            await validateOrReject(request_parameter.body);
          }
        } catch (err_validation: any) {
          res.status(400).send(this.errorToString(err_validation));
          return;
        }

        try {
          const result = await endpoint.fn({
            body: request_parameter.body,
            paths: request_parameter.paths,
            headers: request_parameter.headers,
            query: request_parameter.query
          } as any, x => x);
          res.status(200).json(result);
        } catch (err: any) {
          if (err instanceof Utility.ErrorParam) {
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
      });
    } else {
      throw new Error(`Method "${method} ${url_path}" unsupported.`);
    }
  }
}
