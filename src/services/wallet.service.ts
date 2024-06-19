import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository, WalletRepository } from '@/repositories';
import { Provider as ZkSyncProvider, Wallet as WalletWeb3 } from 'zksync-web3';
import { ConfigService } from '@nestjs/config';
import { decryptData, encryptData } from '@/utils';
import { ActivateAccountZksyncLiteDto, SignMessageDto } from '@/dtos';
import { SignTransactionDto } from '../dtos/wallet/sign-transaction.dto';
import { ERROR_MESSAGES, EZksyncLiteTransactionType } from '@/constants';
import { SignTransactionZksyncLiteDto } from '../dtos/wallet/sign-transaction-zksync-lite.dto';
import * as zksync from 'zksync';
import * as process from 'process';
import { authenticator } from 'otplib';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async createWallet(userId: string, numberWallet: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    const wallets = [];
    for (let i = 0; i < numberWallet; i++) {
      const generatedWallet = WalletWeb3.createRandom();
      const secret =
        this.configService.get<string>('app.prefixSecret') +
        this.configService.get<string>('app.secretPk');
      const encryptedPrivateKey = encryptData(
        generatedWallet.privateKey,
        secret,
      );
      wallets.push({
        address: generatedWallet.address,
        private_key: encryptedPrivateKey,
        user_id: user.id,
      });
    }

    await this.walletRepository.save(wallets);

    return wallets.map((item) => {
      return { address: item.address };
    });
  }

  async getWalletAddresses(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallets'],
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user.wallets || [];
  }

  async getPrivateKeys(userId: string, token: string) {
    const user = await this.userRepository.findOne({
      select: ['authenticator_secret', 'verified_authenticator', 'id'],
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (process.env.APP_ENV == 'production') {
      if (!user.verified_authenticator) {
        throw new BadRequestException(
          ERROR_MESSAGES.USER_NOT_VERIFY_AUTHENTICATOR,
        );
      }

      try {
        const isValid = authenticator.check(token, user.authenticator_secret);

        if (!isValid) {
          throw new BadRequestException(
            ERROR_MESSAGES.VERIFY_AUTHENTICATOR_FAILED,
          );
        }
      } catch (err) {
        console.error(err);
        if (err instanceof BadRequestException) {
          throw err;
        }
        throw new InternalServerErrorException();
      }
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const walletsDB = await this.walletRepository.find({
      where: { user_id: user.id },
      select: ['private_key', 'address', 'network_type'],
    });

    const wallets = walletsDB.map((wallet) => {
      const pk = decryptData(wallet.private_key, secret);
      return {
        address: wallet.address,
        private_key: pk,
        network_type: wallet.network_type,
      };
    });

    return wallets || [];
  }

  async getAuthenticatorSecret(userId: string) {
    const user = await this.userRepository.findOne({
      select: ['authenticator_secret', 'verified_authenticator', 'id'],
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (user.verified_authenticator) {
      throw new BadRequestException(ERROR_MESSAGES.VERIFIED_AUTHENTICATOR_USER);
    }

    return user.authenticator_secret;
  }

  async signMessage(userId: string, transaction: SignMessageDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: { user_id: user.id, address: transaction.address },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = decryptData(wallet.private_key, secret);

    const walletWeb3 = new WalletWeb3(pk);

    return walletWeb3.signMessage(transaction.message);
  }

  async signTransaction(userId: string, transaction: SignTransactionDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: { user_id: user.id, address: transaction.from },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = decryptData(wallet.private_key, secret);

    let walletWeb3 = new WalletWeb3(pk);
    if (!(transaction.customData == null && transaction.type != 113)) {
      if (transaction.chainId == 324) {
        walletWeb3 = new WalletWeb3(
          pk,
          new ZkSyncProvider('https://mainnet.era.zksync.io'),
        );
      } else {
        walletWeb3 = new WalletWeb3(
          pk,
          new ZkSyncProvider('https://testnet.era.zksync.dev'),
        );
      }
    }

    return await walletWeb3.signTransaction(transaction);
  }

  public async activateAccountZkSyncLite(
    userId: string,
    transaction: ActivateAccountZksyncLiteDto,
  ): Promise<string> {
    console.log(transaction);
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: { user_id: user.id, address: transaction.address },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = decryptData(wallet.private_key, secret);

    const walletWeb3Eth = new WalletWeb3(pk);

    const walletWeb3 = await zksync.Wallet.fromEthSigner(
      walletWeb3Eth,
      await zksync.getDefaultProvider('mainnet'),
    );

    const walletAddress = walletWeb3.address();
    const walletInfoResponse = await fetch(
      `https://api.zksync.io/api/v0.2/accounts/${walletAddress}/committed`,
    );
    const walletInfo = await walletInfoResponse.json();
    // Account activated
    if (
      walletInfo?.result?.pubKeyHash !==
      'sync:0000000000000000000000000000000000000000'
    ) {
      throw new InternalServerErrorException('Activated account');
    }
    // Activate account
    const activateTx = await walletWeb3.setSigningKey({
      feeToken: 'ETH',
      ethAuthType: 'ECDSA',
    });
    return activateTx.txHash;
  }

  async zkSyncLiteSignTransaction(
    userId: string,
    transaction: SignTransactionZksyncLiteDto,
  ) {
    console.log(transaction);
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: { user_id: user.id, address: transaction.from },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = decryptData(wallet.private_key, secret);

    const walletWeb3Eth = new WalletWeb3(pk);

    const walletWeb3 = await zksync.Wallet.fromEthSigner(
      walletWeb3Eth,
      await zksync.getDefaultProvider('mainnet'),
    );

    switch (transaction.type) {
      case EZksyncLiteTransactionType.TRANSFER:
        return walletWeb3.signSyncTransfer(transaction.data);
      case EZksyncLiteTransactionType.WITHDRAW_SYNC_TO_ETHEREUM:
        return walletWeb3.signWithdrawFromSyncToEthereum(transaction.data);
      case EZksyncLiteTransactionType.ORDER:
        return walletWeb3.signOrder(transaction.data);
      case EZksyncLiteTransactionType.MINT_NFT:
        return walletWeb3.signMintNFT(transaction.data);
      case EZksyncLiteTransactionType.WITHDRAW_NFT:
        return walletWeb3.signWithdrawNFT(transaction.data);
      case EZksyncLiteTransactionType.SWAP:
        return walletWeb3.signSyncSwap(transaction.data);
      case EZksyncLiteTransactionType.FORCED_EXIT:
        return walletWeb3.signSyncForcedExit(transaction.data);
      default:
        return null;
    }
  }

  async importWallet(userId: string, privateKey: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const walletWeb3 = new WalletWeb3(privateKey);

    const wallet = await this.walletRepository.findOneBy({
      address: walletWeb3.address,
    });

    if (wallet) {
      throw new BadRequestException(ERROR_MESSAGES.WALLET_EXISTS);
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');
    const encryptedPrivateKey = encryptData(walletWeb3.privateKey, secret);

    await this.walletRepository.save({
      user_id: user.id,
      private_key: encryptedPrivateKey,
      address: walletWeb3.address,
      is_import: true,
    });

    return { address: walletWeb3.address };
  }
}
