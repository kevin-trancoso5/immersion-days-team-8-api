import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { Product } from 'product/entities/product.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsUUID('4', { each: true })
  products: string[];
}
