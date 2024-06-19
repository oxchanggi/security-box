import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsString, MinLength } from 'class-validator';

export class SignAllTransactionSolanaDto {
  @ApiProperty({
    example: '21321453543534',
    description: 'From',
  })
  @IsString()
  from: string;

  @ApiProperty({
    example: ['1321321412', '321321'],
    description: 'data',
  })
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @ArrayMinSize(1)
  data: string[];
}
