import { Coa } from '../../ts-model/table/Coa'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class GET_coa_Req_Query {
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'limit must be a number (decimal)' })
  limit?: number
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'page must be a number (decimal)' })
  page?: number
}
class GET_coa_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}

export class GET_coa_Req {
  @Type(() => GET_coa_Req_Query)
  query!: GET_coa_Req_Query
  @Type(() => GET_coa_Req_Headers)
  headers!: GET_coa_Req_Headers
}
export interface GET_coa {
  endpoint: 'GET /coa'
  fn: (param: GET_coa_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<Coa[]>
}
