import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
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
  @Column({ nullable: false })
  total_budget: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ default: true })
  isActive: boolean

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToMany(() => BudgetCategory, (budgetCategory) => budgetCategory.budget)
  budgetCategory: BudgetCategory[]
}
