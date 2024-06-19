import { Module } from '@nestjs/common';
import { UserController } from '@/controllers';
import { configDb } from '@/configs/database';
import { User, Wallet } from '@/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository, WalletRepository } from '@/repositories';
import { SolanaService, UserService, WalletService } from '@/services';
import { configApp } from '@/configs/app';
import { SolanaController } from './controllers/solana.controller';
import { CosmosController } from './controllers/cosmos.controller';
import { CosmosService } from './services/cosmos.service';

const repositories = [UserRepository, WalletRepository];
const services = [UserService, WalletService, SolanaService, CosmosService];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('db'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Wallet]),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configDb, configApp],
    }),
  ],
  controllers: [UserController, SolanaController, CosmosController],
  providers: [...services, ...repositories],
})
export class AppModule {}
