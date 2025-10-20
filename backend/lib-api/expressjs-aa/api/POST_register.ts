import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class POST_register_Req_Body {
  @IsNotEmpty({ message: 'fullname cannot be empty' })
  @IsString({ message: 'fullname must be a string' })
  fullname!: string
  @IsNotEmpty({ message: 'username cannot be empty' })
  @IsString({ message: 'username must be a string' })
  username!: string
  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password must be a string' })
  password!: string
}

export class POST_register_Req {
  @Type(() => POST_register_Req_Body)
  body!: POST_register_Req_Body
}
export interface POST_register {
  endpoint: 'POST /register'
  fn: (param: POST_register_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<boolean>
}
