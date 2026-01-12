import { IsString, IsNumber, IsNotEmpty, IsUrl, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsNumber()
  @Min(0)
  price: number;
}
