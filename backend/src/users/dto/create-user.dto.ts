import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
  CUSTOMER = 'CUSTOMER',
  STORE_ASSISTANT = 'STORE_ASSISTANT',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsInt()
  @IsOptional()
  storeId?: number;

  @IsInt()
  @IsOptional()
  assignedBy?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
