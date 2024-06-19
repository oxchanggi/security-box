import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyAuthenticatorDTO {
  @ApiProperty({
    example: '111111',
    description: 'Authenticator code',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  token: string;
}
