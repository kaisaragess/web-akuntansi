
import { ClassConstructor, Transform, Type, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsBoolean, IsOptional, IsISO8601, IsString, IsEnum, ValidateNested, IsArray, ValidationError, validateOrReject } from "class-validator";

export class Entry {
  @IsNotEmpty({ message: 'id_coa cannot be empty' })
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'id_coa must be a number (decimal)' })
  id_coa!: number
  @IsNotEmpty({ message: 'code_account cannot be empty' })
  @IsString({ message: 'code_account must be a string' })
  code_account!: string
  @IsNotEmpty({ message: 'debit cannot be empty' })
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'debit must be a number (decimal)' })
  debit!: number
  @IsNotEmpty({ message: 'credit cannot be empty' })
  @Transform((param?: any): number | null => (param?.value === null || param?.value === undefined || param?.value === '') ? null : parseFloat(param.value))
  @IsNumber({}, { message: 'credit must be a number (decimal)' })
  credit!: number
}