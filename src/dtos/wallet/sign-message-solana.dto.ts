import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class SignMessageSolanaDto {
  @ApiProperty({
    example: [0, 1, 2, 3],
    description: 'Message to sign',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  data: number[];

  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'Wallet address that you want to sign',
  })
  @IsString()
  @IsEthereumAddress()
  address: string;
}
