import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ESolanaTransactionType } from '@/constants';

export class SignTransactionSolanaDto {
  @ApiProperty({
    example: '21321453543534',
    description: 'From',
  })
  @IsString()
  from: string;

  @ApiProperty({
    example: '32132132321',
    description: 'data',
  })
  @IsString()
  data: string;

  @ApiProperty({
    example: 'transfer',
    description: 'Type transaction of solana',
    enum: Object.values(ESolanaTransactionType),
  })
  @IsString()
  @IsIn(Object.values(ESolanaTransactionType))
  @IsNotEmpty()
  type: ESolanaTransactionType;
}
