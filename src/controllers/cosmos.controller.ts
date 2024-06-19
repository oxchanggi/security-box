import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UserService } from '@/services';
import {
  CreateWalletCosmosDto,
  ImportWalletCosmosDto,
  SignAllTransactionSolanaDto,
  SignMessageSolanaDto, SignTransactionCosmosDto,
  SignTransactionSolanaDto,
} from '@/dtos';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CosmosService } from '../services/cosmos.service';

@ApiTags('Cosmos')
@Controller('cosmos/users')
export class CosmosController {
  constructor(
    private readonly userService: UserService,
    private readonly cosmosService: CosmosService,
  ) {}

  @Post(':id/wallets')
  @ApiOperation({ summary: 'Create wallets for user' })
  async createWallet(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: CreateWalletCosmosDto,
  ) {
    const result = await this.cosmosService.createWallet(
      id,
      data.number_wallet,
      data.prefix,
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
    @Body() data: ImportWalletCosmosDto,
  ) {
    const result = await this.cosmosService.importWallet(
      id,
      data.private_key,
      data.prefix,
    );
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  // @Post(':id/wallets/sign-message')
  // @ApiOperation({ summary: 'Sign message by user' })
  // async signMessage(
  //   @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  //   @Body() data: SignMessageSolanaDto,
  // ) {
  //   const result = await this.solanaService.signMessage(id, data);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: result,
  //   };
  // }

  @Post(':id/wallets/sign-transaction')
  @ApiOperation({ summary: 'Sign transaction by user' })
  async signTransaction(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() transaction: SignTransactionCosmosDto,
  ) {
    const result = await this.cosmosService.signTransaction(id, transaction);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  // @Post(':id/wallets/sign-all-transaction')
  // @ApiOperation({ summary: 'Sign all transaction by user' })
  // async signAllTransaction(
  //   @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  //   @Body()
  //   transaction: SignAllTransactionSolanaDto,
  // ) {
  //   const result = await this.solanaService.signAllTransaction(id, transaction);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: result,
  //   };
  // }
}
