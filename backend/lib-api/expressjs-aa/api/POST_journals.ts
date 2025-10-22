import { Entry } from '../../ts-schema/Entry'
import { JournalRes } from '../../ts-schema/JournalRes'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class POST_journals_Req_Headers {
  @IsNotEmpty({ message: 'authorization cannot be empty' })
  @IsString({ message: 'authorization must be a string' })
  authorization!: string
}
class POST_journals_Req_Body {
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

export class POST_journals_Req {
  @Type(() => POST_journals_Req_Headers)
  headers!: POST_journals_Req_Headers
  @Type(() => POST_journals_Req_Body)
  body!: POST_journals_Req_Body
}
export interface POST_journals {
  endpoint: 'POST /journals'
  fn: (param: POST_journals_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<JournalRes>
}
