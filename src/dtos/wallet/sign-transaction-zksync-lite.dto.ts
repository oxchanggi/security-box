import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EZksyncLiteTransactionType } from '@/constants';

export class SignTransactionZksyncLiteDto {
  @ApiProperty({
    example: 'transfer',
    description: 'Type transaction of zksync lite',
    enum: Object.values(EZksyncLiteTransactionType),
  })
  @IsString()
  @IsIn(Object.values(EZksyncLiteTransactionType))
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'From',
  })
  @IsString()
  @IsEthereumAddress()
  from: string;

  @ApiProperty({
    example: '{}',
    description: 'JSON data',
  })
  @IsOptional()
  @IsNotEmpty()
  data: any;
}
