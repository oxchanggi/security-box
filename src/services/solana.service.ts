import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository, WalletRepository } from '@/repositories';
import { ConfigService } from '@nestjs/config';
import { decryptData, encryptData } from '@/utils';
import {
  SignAllTransactionSolanaDto,
  SignMessageSolanaDto,
  SignTransactionSolanaDto,
} from '@/dtos';
import {
  ERROR_MESSAGES,
  ESolanaTransactionType,
  EWalletNetworkType,
} from '@/constants';
import * as web3 from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

@Injectable()
export class SolanaService {
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
      const keypair = web3.Keypair.generate();
      const privateKey = bs58.encode(keypair.secretKey);
      const secret =
        this.configService.get<string>('app.prefixSecret') +
        this.configService.get<string>('app.secretPk');
      const encryptedPrivateKey = encryptData(privateKey, secret);
      wallets.push({
        address: keypair.publicKey.toString(),
        private_key: encryptedPrivateKey,
        user_id: user.id,
        network_type: 'solana',
      });
    }

    await this.walletRepository.save(wallets);

    return wallets.map((item) => {
      return { address: item.address };
    });
  }

  async signMessage(userId: string, transaction: SignMessageSolanaDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        user_id: user.id,
        address: transaction.address,
        network_type: EWalletNetworkType.SOLANA,
      },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = bs58.decode(decryptData(wallet.private_key, secret));

    // const walletWeb3 = web3.Keypair.fromSecretKey();

    return {
      signature: nacl.sign.detached(new Uint8Array(transaction.data), pk),
    };
  }

  async signTransaction(userId: string, transaction: SignTransactionSolanaDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        user_id: user.id,
        address: transaction.from,
        network_type: EWalletNetworkType.SOLANA,
      },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = bs58.decode(decryptData(wallet.private_key, secret));
    const keypair = web3.Keypair.fromSecretKey(pk);

    if (transaction.type === ESolanaTransactionType.LEGACY_TRANSACTION) {
      const messageTransaction = bs58.decode(transaction.data);
      return {
        signature: bs58.encode(
          nacl.sign.detached(new Uint8Array(messageTransaction), pk),
        ),
        publicKey: keypair.publicKey.toString(),
      };
    } else {
      const transactionBuf = Buffer.from(transaction.data, 'base64');
      const versionedTransaction =
        VersionedTransaction.deserialize(transactionBuf);
      versionedTransaction.sign([keypair]);
      const signerPubkeys =
        versionedTransaction.message.staticAccountKeys.slice(
          0,
          versionedTransaction.message.header.numRequiredSignatures,
        );
      const signerIndex = signerPubkeys.findIndex((pubkey) =>
        pubkey.equals(keypair.publicKey),
      );
      if (signerIndex < 0) {
        throw new BadRequestException(
          ERROR_MESSAGES.NOT_FOUND_SIGNER_IN_TRANSACTION,
        );
      }
      return {
        signature: bs58.encode(versionedTransaction.signatures[signerIndex]),
        publicKey: keypair.publicKey.toString(),
      };
    }
  }

  async signAllTransaction(
    userId: string,
    transaction: SignAllTransactionSolanaDto,
  ) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        user_id: user.id,
        address: transaction.from,
        network_type: EWalletNetworkType.SOLANA,
      },
      select: ['private_key'],
    });

    if (!wallet) {
      throw new NotFoundException();
    }

    const secret =
      this.configService.get<string>('app.prefixSecret') +
      this.configService.get<string>('app.secretPk');

    const pk = bs58.decode(decryptData(wallet.private_key, secret));

    const keypair = web3.Keypair.fromSecretKey(pk);

    return {
      signatures: transaction.data.map((item) => {
        const messageTransaction = bs58.decode(item);
        return bs58.encode(
          nacl.sign.detached(new Uint8Array(messageTransaction), pk),
        );
      }),
      publicKey: keypair.publicKey.toString(),
    };
  }

  private validatePrivateKey(privateKey: string): boolean {
    try {
      const keypair = web3.Keypair.fromSecretKey(bs58.decode(privateKey));
      return keypair.secretKey.length === 64;
    } catch (e) {
      return false;
    }
  }

  async importWallet(userId: string, privateKey: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (!this.validatePrivateKey(privateKey)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_PRIVATE_KEY);
    }

    const keypair = web3.Keypair.fromSecretKey(bs58.decode(privateKey));

    const wallet = await this.walletRepository.findOneBy({
      address: keypair.publicKey.toString(),
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
      address: keypair.publicKey.toString(),
      network_type: EWalletNetworkType.SOLANA,
      is_import: true,
    });

    return { address: keypair.publicKey.toString() };
  }
}
