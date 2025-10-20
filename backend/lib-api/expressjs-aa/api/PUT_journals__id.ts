import { Entry } from '../../ts-schema/Entry'
import { JournalRes } from '../../ts-schema/JournalRes'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class PUT_journals__id_Req_Paths {
  @IsOptional()
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id must be a number (decimal)' })
  id!: number
}
class PUT_journals__id_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}
class PUT_journals__id_Req_Body {
  @IsNotEmpty({ message: 'date cannot be empty' })
  @IsString({ message: 'date must be a string' })
  date!: string
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string
  @IsOptional()
  @IsString({ message: 'lampiran must be a string' })
  lampiran?: string
  @IsOptional()
  @IsString({ message: 'referensi must be a string' })
  referensi?: string
  @IsNotEmpty({ message: 'entries cannot be empty' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Entry)
  entries!: Entry[]
}

export class PUT_journals__id_Req {
  @Type(() => PUT_journals__id_Req_Paths)
  paths!: PUT_journals__id_Req_Paths
  @Type(() => PUT_journals__id_Req_Headers)
  headers!: PUT_journals__id_Req_Headers
  @Type(() => PUT_journals__id_Req_Body)
  body!: PUT_journals__id_Req_Body
}
export interface PUT_journals__id {
  endpoint: 'PUT /journals/:id'
  fn: (param: PUT_journals__id_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<JournalRes>
}
