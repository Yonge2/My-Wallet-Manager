import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { BudgetCategory } from './budget-category.entity'
import { History } from './history.entity'

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30, unique: true, nullable: false })
  category: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => BudgetCategory, (budgetCategory) => budgetCategory.category)
  budgetCategory: BudgetCategory[]

  @OneToMany(() => History, (history) => history.category)
  history: History[]
}
