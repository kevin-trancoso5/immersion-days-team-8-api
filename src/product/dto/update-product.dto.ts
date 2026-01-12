import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  declare name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  declare imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declare price?: number;
}
