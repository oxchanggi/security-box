import { Wallet } from '@/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class WalletRepository extends Repository<Wallet> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Wallet, dataSource.createEntityManager());
  }
}
