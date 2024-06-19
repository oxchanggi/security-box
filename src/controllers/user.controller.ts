import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService, WalletService } from '@/services';
import { VerifyAuthenticatorDTO } from '../dtos/user/verify-authenticator.dto';
import {
  ActivateAccountZksyncLiteDto,
  CreateWalletDto,
  GetPrivateKeyDto,
  ImportWalletDto,
  SignMessageDto,
} from '@/dtos';
import { SignTransactionDto } from '../dtos/wallet/sign-transaction.dto';
import { SignTransactionValidatorPipe } from '@/validators';
import { ApiOperation } from '@nestjs/swagger';
import { SignTransactionZksyncLiteDto } from '../dtos/wallet/sign-transaction-zksync-lite.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async createUser() {
    const result = await this.userService.create();
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Put(':id/verify-authenticator')
  @ApiOperation({ summary: 'Verify user to get private keys' })
  async verifyAuthenticator(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: VerifyAuthenticatorDTO,
  ) {
    const result = await this.userService.verifyAuthenticator(id, data.token);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  // @Put(':id/remove-verify-authenticator')
  // @ApiOperation({ summary: 'Remove verify authenticator' })
  // async removeVerifiedAuthenticator(
  //   @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  // ) {
  //   const result = await this.userService.removeVerifiedAuthenticator(id);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: result,
  //   };
  // }

  @Post(':id/wallets')
  @ApiOperation({ summary: 'Create wallets for user' })
  async createWallet(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: CreateWalletDto,
  ) {
    const result = await this.walletService.createWallet(
      id,
      data.number_wallet,
    );
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Get(':id/authenticator-secret')
  @ApiOperation({ summary: 'Get authenticator secret by user' })
  async getAuthenticatorSecret(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const result = await this.walletService.getAuthenticatorSecret(id);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/import')
  @ApiOperation({ summary: 'Import a wallet for user' })
  async importWallet(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: ImportWalletDto,
  ) {
    const result = await this.walletService.importWallet(id, data.private_key);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Get(':id/wallets/addresses')
  @ApiOperation({ summary: 'Get addresses of user' })
  async getWalletAddresses(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const result = await this.walletService.getWalletAddresses(id);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Get(':id/wallets/private-keys')
  @ApiOperation({ summary: 'Get private keys of verified user' })
  async getPrivateKeys(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: GetPrivateKeyDto,
  ) {
    const result = await this.walletService.getPrivateKeys(id, query.token);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/sign-message')
  @ApiOperation({ summary: 'Sign message by user' })
  async signMessage(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: SignMessageDto,
  ) {
    const result = await this.walletService.signMessage(id, data);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/zksync-lite/sign-transaction')
  @ApiOperation({ summary: 'Sign transaction on the zkSync Lite by user' })
  async zkSyncLiteSignTransaction(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: SignTransactionZksyncLiteDto,
  ) {
    const result = await this.walletService.zkSyncLiteSignTransaction(id, data);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/zksync-lite/activate-account')
  @ApiOperation({ summary: 'Activate account on the zkSync Lite by user' })
  async zkSyncLiteActivateAccount(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: ActivateAccountZksyncLiteDto,
  ) {
    const result = await this.walletService.activateAccountZkSyncLite(id, data);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/sign-transaction')
  @ApiOperation({ summary: 'Sign transaction by user' })
  async signTransaction(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(SignTransactionValidatorPipe) transaction: SignTransactionDto,
  ) {
    const result = await this.walletService.signTransaction(id, transaction);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }
}
