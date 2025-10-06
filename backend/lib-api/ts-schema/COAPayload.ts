
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class COAPayload {
  @IsNotEmpty({ message: 'code_account cannot be empty' })
  @IsString({ message: 'code_account must be a string' })
  code_account!: string
  @IsNotEmpty({ message: 'account cannot be empty' })
  @IsString({ message: 'account must be a string' })
  account!: string
  @IsNotEmpty({ message: 'jenis cannot be empty' })
  @IsString({ message: 'jenis must be a string' })
  jenis!: string
  @IsNotEmpty({ message: 'description cannot be empty' })
  @IsString({ message: 'description must be a string' })
  description!: string
  @IsNotEmpty({ message: 'normal_balance cannot be empty' })
  @IsString({ message: 'normal_balance must be a string' })
  normal_balance!: string
  @IsNotEmpty({ message: 'created cannot be empty' })
  @IsString({ message: 'created must be a string' })
  created!: string
}