import { JournalRes } from '../../ts-schema/JournalRes'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class DELETE_journals__id_Req_Paths {
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id must be a number (decimal)' })
  id!: number
}
class DELETE_journals__id_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}

export class DELETE_journals__id_Req {
  @Type(() => DELETE_journals__id_Req_Paths)
  paths!: DELETE_journals__id_Req_Paths
  @Type(() => DELETE_journals__id_Req_Headers)
  headers!: DELETE_journals__id_Req_Headers
}
export interface DELETE_journals__id {
  endpoint: 'DELETE /journals/:id'
  fn: (param: DELETE_journals__id_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<JournalRes>
}
