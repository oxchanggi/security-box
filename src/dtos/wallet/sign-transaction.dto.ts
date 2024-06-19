import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BigNumber } from 'ethers';
import { Transform } from 'class-transformer';

export class SignTransactionDto {
  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'From',
  })
  @IsString()
  @IsEthereumAddress()
  from: string;

  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'to',
  })
  @IsOptional()
  @IsEthereumAddress()
  to?: string;

  @ApiProperty({
    example: '23',
    description: 'nonce',
  })
  @IsNumber()
  @Min(0)
  @Max(100000)
  nonce: BigNumber;

  @ApiProperty({
    example: '100000',
    description: 'gasLimit',
  })
  @IsString()
  gasLimit: BigNumber;

  @ApiPropertyOptional({
    example: '100000',
    description: 'gasPrice',
  })
  @IsString()
  @IsOptional()
  gasPrice?: BigNumber;

  @ApiProperty({
    example: '0x',
    description: 'data',
  })
  @IsString()
  data: string;

  @ApiProperty({
    example: '100000',
    description: 'value',
  })
  @IsString()
  @Transform(({ value }) => value?.toString())
  value: BigNumber;

  @ApiProperty({
    example: 1,
    description: 'chainId',
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  chainId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'type',
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  type?: number;

  @ApiProperty({
    example: '100000',
    description: 'gasLimit',
  })
  @IsString()
  @IsOptional()
  maxPriorityFeePerGas?: BigNumber;

  @ApiProperty({
    example: '100000',
    description: 'gasPrice',
  })
  @IsString()
  @IsOptional()
  maxFeePerGas?: BigNumber;

  @ApiProperty({
    example: '{}',
    description: 'JSON data',
  })
  @IsOptional()
  customData?: any;
}
