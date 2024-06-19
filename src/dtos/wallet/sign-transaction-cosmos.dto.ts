import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsNumber, IsObject, IsString} from 'class-validator';
import { ESolanaTransactionType } from '@/constants';

export class SignTransactionCosmosDto {
  @ApiProperty({
    example: '21321453543534',
    description: 'From',
  })
  @IsString()
  from: string;

  @ApiProperty({
    example: '{}',
    description: 'txBodyEncodeObject',
  })
  @IsObject()
  tx_body: object;

  @ApiProperty({
    example: '{}',
    description: 'StdFee',
  })
  @IsObject()
  fee: object;

  @ApiProperty({
    example: 1,
    description: 'SignerData',
  })
  @IsNumber()
  account_number: number;

  @ApiProperty({
    example: 1,
    description: 'SignerData',
  })
  @IsNumber()
  sequence: number;

  @ApiProperty({
    example: '1',
    description: 'SignerData',
  })
  @IsString()
  chainId: string;

  @ApiProperty({
    example: 'celestia',
    description: 'Prefix network',
    enum: ['celestia', 'cosmos', 'inj'],
  })
  @IsString()
  @IsIn(['celestia', 'cosmos', 'inj'])
  @IsNotEmpty()
  prefix: string;
}
