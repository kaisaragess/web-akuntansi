import { Coa } from '../../ts-model/table/Coa'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class GET_coa__id_Req_Paths {
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id must be a number (decimal)' })
  id!: number
}
class GET_coa__id_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}

export class GET_coa__id_Req {
  @Type(() => GET_coa__id_Req_Paths)
  paths!: GET_coa__id_Req_Paths
  @Type(() => GET_coa__id_Req_Headers)
  headers!: GET_coa__id_Req_Headers
}
export interface GET_coa__id {
  endpoint: 'GET /coa/:id'
  fn: (param: GET_coa__id_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<Coa>
}
