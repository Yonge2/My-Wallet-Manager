import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { Budget } from './budget.entity'
import { Category } from './category.entity'

@Entity({ name: 'budget_category' })
export class BudgetCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  amount: number

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Budget, (budget) => budget.budgetCategory)
  budget: Budget

  @ManyToOne(() => Category, (category) => category.budgetCategory)
  category: Category
}
