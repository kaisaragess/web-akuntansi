import { Entry } from '../ts-schema/Entry'

import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class JournalRes {
  @IsNotEmpty({ message: 'id cannot be empty' })
  @IsString({ message: 'id must be a string' })
  id!: string
  @IsNotEmpty({ message: 'id_user cannot be empty' })
  @IsString({ message: 'id_user must be a string' })
  id_user!: string
  @IsNotEmpty({ message: 'date cannot be empty' })
  @IsString({ message: 'date must be a string' })
  date!: string
  @IsNotEmpty({ message: 'description cannot be empty' })
  @IsString({ message: 'description must be a string' })
  description!: string
  @IsNotEmpty({ message: 'entries cannot be empty' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Entry)
  entries!: Entry[]
}