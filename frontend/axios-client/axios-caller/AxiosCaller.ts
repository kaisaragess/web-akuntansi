import axios, { AxiosInstance } from 'axios';
import { POST_journals_Req } from '../axios-caller/api/POST_journals';
import { GET_journals_Req } from '../axios-caller/api/GET_journals';
import { GET_journals__id_Req } from '../axios-caller/api/GET_journals__id';
import { PUT_journals__id_Req } from '../axios-caller/api/PUT_journals__id';
import { DELETE_journals__id_Req } from '../axios-caller/api/DELETE_journals__id';
import { POST_login_Req } from '../axios-caller/api/POST_login';
import { POST_register_Req } from '../axios-caller/api/POST_register';
import { POST_coa_Req } from '../axios-caller/api/POST_coa';
import { GET_coa_Req } from '../axios-caller/api/GET_coa';
import { GET_coa__id_Req } from '../axios-caller/api/GET_coa__id';
import { PUT_coa__id_Req } from '../axios-caller/api/PUT_coa__id';
import { DELETE_coa__id_Req } from '../axios-caller/api/DELETE_coa__id';
import { JournalRes } from '../ts-schema/JournalRes'
import { AuthResponse } from '../ts-schema/AuthResponse'
import { COAPayload } from '../ts-schema/COAPayload'
import { Coa } from '../ts-model/table/Coa'

export class AxiosCaller {
  public axios_instance: AxiosInstance | null = null;

  public call = {
    'POST /journals': async (param: POST_journals_Req): Promise<JournalRes> => {
      let clean_path = '/journals';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.post(clean_path, param.body, {
        
        headers: param.headers as any,
      })).data
    },
    'GET /journals': async (param: GET_journals_Req): Promise<JournalRes[]> => {
      let clean_path = '/journals';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.get(clean_path, {
        params: param.query,
        headers: param.headers as any,
      })).data
    },
    'GET /journals/:id': async (param: GET_journals__id_Req): Promise<JournalRes> => {
      let clean_path = '/journals/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.get(clean_path, {
        
        headers: param.headers as any,
      })).data
    },
    'PUT /journals/:id': async (param: PUT_journals__id_Req): Promise<JournalRes> => {
      let clean_path = '/journals/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.put(clean_path, param.body, {
        
        headers: param.headers as any,
      })).data
    },
    'DELETE /journals/:id': async (param: DELETE_journals__id_Req): Promise<JournalRes> => {
      let clean_path = '/journals/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.delete(clean_path, {
        
        headers: param.headers as any,
      })).data
    },
    'POST /login': async (param: POST_login_Req): Promise<AuthResponse> => {
      let clean_path = '/login';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.post(clean_path, param.body, {
        
        
      })).data
    },
    'POST /register': async (param: POST_register_Req): Promise<AuthResponse> => {
      let clean_path = '/register';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.post(clean_path, param.body, {
        
        
      })).data
    },
    'POST /coa': async (param: POST_coa_Req): Promise<COAPayload> => {
      let clean_path = '/coa';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.post(clean_path, param.body, {
        
        headers: param.headers as any,
      })).data
    },
    'GET /coa': async (param: GET_coa_Req): Promise<Coa[]> => {
      let clean_path = '/coa';
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.get(clean_path, {
        params: param.query,
        headers: param.headers as any,
      })).data
    },
    'GET /coa/:id': async (param: GET_coa__id_Req): Promise<Coa> => {
      let clean_path = '/coa/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.get(clean_path, {
        
        headers: param.headers as any,
      })).data
    },
    'PUT /coa/:id': async (param: PUT_coa__id_Req): Promise<Coa> => {
      let clean_path = '/coa/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.put(clean_path, param.body, {
        
        headers: param.headers as any,
      })).data
    },
    'DELETE /coa/:id': async (param: DELETE_coa__id_Req): Promise<Coa> => {
      let clean_path = '/coa/:id';
      for (const key of Object.keys(param.paths)) {
        clean_path = clean_path.replace(`:${key}`, (param.paths as any)[key]);
      }
      if (!this.axios_instance) {
        throw new Error('Axios not initialized');
      }
      return (await this.axios_instance.delete(clean_path, {
        
        headers: param.headers as any,
      })).data
    }
  }

  constructor(base_url: string) {
    this.axios_instance = axios.create({ baseURL: base_url });
  }
}

