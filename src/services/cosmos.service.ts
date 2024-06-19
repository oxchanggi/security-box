import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository, WalletRepository } from '@/repositories';
import { ConfigService } from '@nestjs/config';
import { decryptData, encryptData } from '@/utils';
import { SignTransactionCosmosDto } from '@/dtos';
import { ERROR_MESSAGES } from '@/constants';
import { createPrivateKey, getSignerFromPrivateKey } from '../utils/cosmos';
import {
  encodePubkey,
  GeneratedType,
  makeAuthInfoBytes,
  makeSignDoc,
  Registry,
} from '@cosmjs/proto-signing';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { encodeSecp256k1Pubkey } from '@cosmjs/amino';
import { Int53 } from '@cosmjs/math';
import { StdFee } from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { fromBase64 } from '@cosmjs/encoding';
import { stakingTypes } from '@cosmjs/stargate/build/modules';

@Injectable()
export class CosmosService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async createWallet(userId: string, numberWallet: number, prefix: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    const wallets = [];
    for (let i = 0; i < numberWallet; i++) {
      const privateKey = await createPrivateKey(prefix);
      const signer = await getSignerFromPrivateKey(privateKey, prefix);
      const secret =
        this.configService.get<string>('app.prefixSecret') +
        this.configService.get<string>('app.secretPk');
      const encryptedPrivateKey = encryptData(privateKey, secret);
      const address = (await signer.getAccounts())[0].address;
      wallets.push({
        address: address,
        private_key: encryptedPrivateKey,
        user_id: user.id,
        network_type: prefix,
      });
    }

    await this.walletRepository.save(wallets);

    return wallets.map((item) => {
      return { address: item.address };
    });
  }

  async signTransaction(userId: string, transaction: SignTransactionCosmosDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const prefix = transaction.prefix;

    const wallet = await this.walletRepository.findOne({
      where: {
        user_id: user.id,
        address: transaction.from,
        network_type: transaction.prefix as any,
      },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');
    const signer = await getSignerFromPrivateKey(
      decryptData(wallet.private_key, secret),
      prefix,
    );

    const account = (await signer.getAccounts())[0];

    const pubkey = encodePubkey(encodeSecp256k1Pubkey(account.pubkey));
    const fee = transaction.fee as StdFee;
    const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
      ['/cosmos.base.v1beta1.Coin', Coin],
      ...stakingTypes,
    ];
    const isStaking =
      (transaction?.tx_body as any)?.value?.messages[0]?.typeUrl?.includes('staking');
    const registry = isStaking
      ? new Registry(defaultRegistryTypes)
      : new Registry();
    const txBodyBytes = registry.encode(transaction.tx_body as any);
    const gasLimit = Int53.fromString(fee?.gas).toNumber();

    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: transaction.sequence }],
      fee?.amount,
      gasLimit,
      fee?.granter,
      fee?.payer,
    );

    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      transaction.chainId,
      transaction.account_number,
    );

    const { signature, signed } = await signer.signDirect(
      account.address,
      signDoc,
    );
    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private async validatePrivateKey(
    privateKey: string,
    prefix: string,
  ): Promise<boolean> {
    try {
      const signer = await getSignerFromPrivateKey(privateKey, prefix);
      if ((await signer.getAccounts()).length > 0) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async importWallet(userId: string, privateKey: string, prefix: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (!(await this.validatePrivateKey(privateKey, prefix))) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_PRIVATE_KEY);
    }

    const signer = await getSignerFromPrivateKey(privateKey, prefix);

    const address = (await signer.getAccounts())[0].address;

    const wallet = await this.walletRepository.findOneBy({
      address: address,
    });

    if (wallet) {
      throw new BadRequestException(ERROR_MESSAGES.WALLET_EXISTS);
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');
    const encryptedPrivateKey = encryptData(privateKey, secret);

    await this.walletRepository.save({
      user_id: user.id,
      private_key: encryptedPrivateKey,
      address: address,
      network_type: prefix as any,
      is_import: true,
    });

    return { address };
  }
}
