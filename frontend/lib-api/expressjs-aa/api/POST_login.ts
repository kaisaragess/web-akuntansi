import { AuthResponse } from '../../ts-schema/AuthResponse'
import { Utility } from '../Utility';
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

class POST_login_Req_Body {
  @IsNotEmpty({ message: 'username cannot be empty' })
  @IsString({ message: 'username must be a string' })
  username!: string
  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password must be a string' })
  password!: string
}

export class POST_login_Req {
  @Type(() => POST_login_Req_Body)
  body!: POST_login_Req_Body
}
export interface POST_login {
  endpoint: 'POST /login'
  fn: (param: POST_login_Req, Error: (param: Utility.ErrorParam<string>) => Utility.ErrorParam<string>) => Promise<AuthResponse>
}
