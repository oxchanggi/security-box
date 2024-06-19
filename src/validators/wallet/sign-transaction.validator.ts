import { Injectable, PipeTransform } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { SignTransactionDto } from '@/dtos';

@Injectable()
export class SignTransactionValidatorPipe
  implements PipeTransform<SignTransactionDto>
{
  async transform(value: SignTransactionDto) {
    const data = {
      ...value,
      nonce: BigNumber.from(value.nonce),
      value: BigNumber.from(value.value || 0),
    };

    if (value.maxPriorityFeePerGas) {
      data.maxPriorityFeePerGas = BigNumber.from(value.maxPriorityFeePerGas);
    }

    if (value.maxFeePerGas) {
      data.maxFeePerGas = BigNumber.from(value.maxFeePerGas);
    }

    if (value.gasLimit) {
      data.gasLimit = BigNumber.from(value.gasLimit);
    }

    if (value.gasPrice) {
      data.gasPrice = BigNumber.from(value.gasPrice);
    }

    return data;
  }
}
