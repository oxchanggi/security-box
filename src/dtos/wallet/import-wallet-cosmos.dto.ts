import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsString} from 'class-validator';

export class ImportWalletCosmosDto {
  @ApiProperty({
    example: 'Privatekey',
    description: 'Private key',
  })
  @IsString()
  @IsNotEmpty()
  private_key: string;

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
