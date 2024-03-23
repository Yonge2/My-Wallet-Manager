import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm'
import { BudgetCategory } from './budget-category.entity'
import { History } from './history.entity'

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30, unique: true, nullable: false })
  category: string

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => BudgetCategory, (budgetCategory) => budgetCategory.category)
  budgetCategory: BudgetCategory[]

  @OneToMany(() => History, (history) => history.category)
  history: History[]
}
