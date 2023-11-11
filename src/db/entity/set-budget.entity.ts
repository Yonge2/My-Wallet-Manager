import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'set_budget' })
export class SetBudget {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  user_id: number

  @Column({ nullable: false })
  total_amount: number

  @Column('simple-json', { nullable: false })
  budget_field: {
    [key: string]: number
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User, (user) => user.setBudget)
  @JoinColumn()
  user: User
}
