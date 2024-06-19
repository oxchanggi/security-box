import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    example: 3,
    description: 'Number of the wallet that you want to create',
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  number_wallet: number;
}
