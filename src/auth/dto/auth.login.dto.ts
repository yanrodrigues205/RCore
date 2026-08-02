import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'The primary email address for the user account',
    example: 'example@example.com' 
  })
  @IsEmail({}, { message: 'The email provided must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ 
    description: 'The account password',
    example: 'moth3301' 
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
