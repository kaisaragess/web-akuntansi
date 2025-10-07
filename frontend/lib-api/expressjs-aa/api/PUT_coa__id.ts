import { COAPayload } from '../../ts-schema/COAPayload'
import { Coa } from '../../ts-model/table/Coa'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class PUT_coa__id_Req_Paths {
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id must be a number (decimal)' })
  id!: number
}
class PUT_coa__id_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}
class PUT_coa__id_Req_Body {
  @IsNotEmpty({ message: 'data cannot be empty' })
  @IsObject()
  @ValidateNested()
  @Type(() => COAPayload)
  data!: COAPayload
}

export class PUT_coa__id_Req {
  @Type(() => PUT_coa__id_Req_Paths)
  paths!: PUT_coa__id_Req_Paths
  @Type(() => PUT_coa__id_Req_Headers)
  headers!: PUT_coa__id_Req_Headers
  @Type(() => PUT_coa__id_Req_Body)
  body!: PUT_coa__id_Req_Body
}
export interface PUT_coa__id {
  endpoint: 'PUT /coa/:id'
  fn: (param: PUT_coa__id_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<Coa>
}
