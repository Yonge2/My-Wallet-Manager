import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { WalletHistory } from './wallet-history.entity'
import { SetBudget } from './set-budget.entity'

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30 }) //unique: true로 변경
  email: string

  @Column({ length: 255 })
  password: string

  @Column({ length: 20 })
  name: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => WalletHistory, (walletHistory) => walletHistory.user)
  wallethistories: WalletHistory[]

  @OneToOne(() => SetBudget, (setBudget) => setBudget.user)
  @JoinColumn()
  setBudget: SetBudget
}
