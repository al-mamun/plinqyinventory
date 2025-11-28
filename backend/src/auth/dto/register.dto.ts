import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password (minimum 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsOptional()
  name?: string;
}
