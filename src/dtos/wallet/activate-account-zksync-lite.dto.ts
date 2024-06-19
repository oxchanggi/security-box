import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString } from 'class-validator';

export class ActivateAccountZksyncLiteDto {
  @ApiProperty({
    example: '0xbd72461C752D5d1a3f5340b6769Fc1B64C11350A',
    description: 'Address',
  })
  @IsString()
  @IsEthereumAddress()
  address: string;
}
