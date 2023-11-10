import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'budget-category' })
export class BudgetCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20, unique: true, nullable: false })
  category: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
