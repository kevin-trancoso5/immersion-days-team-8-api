import { IsString, IsOptional } from 'class-validator';
import { Product } from 'product/entities/product.entity';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  products: Product[];
}
