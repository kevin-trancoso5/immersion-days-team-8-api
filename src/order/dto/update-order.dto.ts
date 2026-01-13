import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  productIds?: string[];
}
