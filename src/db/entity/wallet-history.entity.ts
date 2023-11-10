import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'wallet-history' })
export class WalletHistory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, nullable: false })
  category: string

  @Column({ nullable: false })
  amount: Number

  @Column({ length: 50, nullable: true })
  memo: string

  @Column({ nullable: false })
  user_id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.wallethistories)
  user: User
}
