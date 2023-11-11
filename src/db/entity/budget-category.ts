import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity({ name: 'budget_category' })
export class BudgetCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, unique: true, nullable: false })
  category: string

  @CreateDateColumn()
  createdAt: Date
}
