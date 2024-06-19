import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { SolanaService, UserService } from '@/services';
import {
  CreateWalletDto,
  ImportWalletDto,
  SignAllTransactionSolanaDto,
  SignMessageSolanaDto, SignTransactionSolanaDto,
} from '@/dtos';
import { SignTransactionDto } from '../dtos/wallet/sign-transaction.dto';
import { SignTransactionValidatorPipe } from '@/validators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Solana')
@Controller('solana/users')
export class SolanaController {
  constructor(
    private readonly userService: UserService,
    private readonly solanaService: SolanaService,
  ) {}

  @Post(':id/wallets')
  @ApiOperation({ summary: 'Create wallets for user' })
  async createWallet(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: CreateWalletDto,
  ) {
    const result = await this.solanaService.createWallet(
      id,
      data.number_wallet,
    );
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
    const result = await this.solanaService.importWallet(id, data.private_key);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/sign-message')
  @ApiOperation({ summary: 'Sign message by user' })
  async signMessage(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: SignMessageSolanaDto,
  ) {
    const result = await this.solanaService.signMessage(id, data);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/sign-transaction')
  @ApiOperation({ summary: 'Sign transaction by user' })
  async signTransaction(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() transaction: SignTransactionSolanaDto,
  ) {
    const result = await this.solanaService.signTransaction(id, transaction);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post(':id/wallets/sign-all-transaction')
  @ApiOperation({ summary: 'Sign all transaction by user' })
  async signAllTransaction(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body()
    transaction: SignAllTransactionSolanaDto,
  ) {
    const result = await this.solanaService.signAllTransaction(id, transaction);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }
}
