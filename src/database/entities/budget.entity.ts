import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { User } from './user.entity'
import { BudgetCategory } from './budget-category.entity'

@Entity({ name: 'budget' })
export class Budget {
  @PrimaryColumn()
  userId: number

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User

  @Column({ nullable: false })
  total_budget: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ default: true })
  isActive: boolean

  @OneToMany(() => BudgetCategory, (budgetCategory) => budgetCategory.budget)
  budgetCategory: BudgetCategory[]
}
