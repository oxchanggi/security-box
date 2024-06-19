import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignMessageDto {
  @ApiProperty({
    example: 3,
    description: 'Message to sign',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'Wallet address that you want to sign',
  })
  @IsString()
  @IsEthereumAddress()
  address: string;
}
