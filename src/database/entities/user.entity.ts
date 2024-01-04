import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm'
import { History } from './history.entity'

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 50, unique: true })
  email: string

  @Column({ nullable: false })
  password: string

  @Column({ length: 20, nullable: false })
  name: string

  @Column({ default: false })
  isManager: boolean

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateddAt: Date

  @OneToMany(() => History, (walletHistory) => walletHistory.user)
  wallethistories: History[]
}
