import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsNumber, IsString, Max, Min} from 'class-validator';

export class CreateWalletCosmosDto {
  @ApiProperty({
    example: 3,
    description: 'Number of the wallet that you want to create',
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  number_wallet: number;

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
