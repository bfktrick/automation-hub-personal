import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@automation-hub.local',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'User password',
  })
  @IsString()
  @MinLength(1)
  password: string;
}
