import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { EWalletNetworkType, EWalletStatus } from '@/constants';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column({ select: false })
  private_key: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (entity) => entity.wallets)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({
    type: 'enum',
    enum: EWalletStatus,
    default: EWalletStatus.UNBOX,
  })
  status: EWalletStatus;

  @Column({ default: false })
  is_import: boolean;

  @Column({
    type: 'enum',
    enum: EWalletNetworkType,
    default: EWalletNetworkType.EVM,
  })
  network_type: EWalletNetworkType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
