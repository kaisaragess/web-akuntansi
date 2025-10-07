import { User } from '../../ts-model/table/User'

import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class Coa {
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseInt(param.value))
  @IsNumber({}, { message: 'id must be a number (integer)' })
  id!: number
  @IsString({ message: 'code_account must be a string' })
  code_account!: string
  @IsString({ message: 'account must be a string' })
  account!: string
  @IsString({ message: 'jenis must be a string' })
  jenis!: string
  @IsString({ message: 'description must be a string' })
  description!: string
  @IsString({ message: 'normal_balance must be a string' })
  normal_balance!: string
  otm_created_by!: User;
  created_by!: number
}