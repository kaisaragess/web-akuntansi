import { Entry } from '../ts-schema/Entry'

import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class JournalRes {
  @IsNotEmpty({ message: 'id cannot be empty' })
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id must be a number (decimal)' })
  id!: number
  @IsNotEmpty({ message: 'id_user cannot be empty' })
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id_user must be a number (decimal)' })
  id_user!: number
  @IsNotEmpty({ message: 'date cannot be empty' })
  @IsString({ message: 'date must be a string' })
  date!: string
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string
  @IsNotEmpty({ message: 'nomor_bukti cannot be empty' })
  @IsString({ message: 'nomor_bukti must be a string' })
  nomor_bukti!: string
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