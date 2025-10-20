import { COAPayload } from '../../ts-schema/COAPayload'
import { COAPayload } from '../../ts-schema/COAPayload'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class POST_coa_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}
class POST_coa_Req_Body {
  @IsNotEmpty({ message: 'data cannot be empty' })
  @IsObject()
  @ValidateNested()
  @Type(() => COAPayload)
  data!: COAPayload
}

export class POST_coa_Req {
  @Type(() => POST_coa_Req_Headers)
  headers!: POST_coa_Req_Headers
  @Type(() => POST_coa_Req_Body)
  body!: POST_coa_Req_Body
}
export interface POST_coa {
  endpoint: 'POST /coa'
  fn: (param: POST_coa_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<COAPayload>
}
