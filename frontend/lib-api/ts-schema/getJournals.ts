
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class getJournals {
  @IsNotEmpty({ message: 'id cannot be empty' })
  @IsString({ message: 'id must be a string' })
  id!: string
  @IsNotEmpty({ message: 'date cannot be empty' })
  @IsString({ message: 'date must be a string' })
  date!: string
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string
}