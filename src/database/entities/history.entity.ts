import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { User } from './user.entity'
import { Category } from './category.entity'

@Entity({ name: 'history' })
export class History {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  amount: number

  @Column({ nullable: true })
  memo: string

  @Column({ nullable: true })
  imageUrl: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.wallethistories)
  user: User

  @ManyToOne(() => Category, (category) => category.history)
  category: Category
}
