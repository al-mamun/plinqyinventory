import { IsString, IsNumber, IsOptional, IsInt, Min, IsArray, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  compare_at_price?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsUUID()
  store_id: string;
}
