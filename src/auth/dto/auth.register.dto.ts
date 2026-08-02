import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ 
    description: 'The primary email address for the user account',
    example: 'example@example.com' 
  })
  @IsEmail({}, { message: 'The email provided must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ 
    description: 'Secure password for the account (minimum 6 characters)',
    example: 'moth3301',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({ 
    description: 'Full name of the client user',
    example: 'Example Name' 
  })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;
}
