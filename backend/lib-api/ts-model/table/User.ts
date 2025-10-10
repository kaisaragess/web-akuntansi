import { UserType } from '../../ts-model/enum/UserType'

import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class User {
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseInt(param.value))
  @IsNumber({}, { message: 'id must be a number (integer)' })
  id!: number
  @IsString({ message: 'fullname must be a string' })
  fullname!: string
  @IsString({ message: 'username must be a string' })
  username!: string
  @IsString({ message: 'password must be a string' })
  password!: string
  @IsEnum(UserType, { message: 'role must be enum UserType' })
  role!: UserType
  @Transform((param?: any): Date | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : new Date(param?.value))
  @IsISO8601({}, { message: 'created_at must be an ISO8601 date' })
  created_at!: Date
}