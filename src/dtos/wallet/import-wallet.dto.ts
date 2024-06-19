import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImportWalletDto {
  @ApiProperty({
    example: 'Privatekey',
    description: 'Private key',
  })
  @IsString()
  @IsNotEmpty()
  private_key: string;
}
