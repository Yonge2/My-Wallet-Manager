import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { User } from 'src/database/entities/user.entity'
import { JoinDto } from './dto/join.dto'

@Injectable()
export class AuthRepository {
  constructor(private readonly dataSource: DataSource) {}

  async isExistEmail(email: string) {
    return !(await this.dataSource.manager.exists(User, {
      where: { email },
    }))
  }

  async insertUser(joinDto: JoinDto) {
    try {
      await this.dataSource.manager.insert(User, joinDto)
      return true
    } catch (err) {
      console.log('join err : ', err)
      return false
    }
  }

  async findLoginInfo(
    email: string,
  ): Promise<{ id: number; email: string; password: string; name: string; isManager: boolean }> {
    return await this.dataSource.manager.findOne(User, {
      select: ['id', 'email', 'password', 'name', 'isManager'],
      where: { email: email, isActive: true },
    })
  }

  async findUserInfo(userId: number): Promise<{ id: number; name: string; isManager: boolean }> {
    return await this.dataSource.manager.findOne(User, {
      select: ['id', 'name', 'isManager'],
      where: { id: userId, isActive: true },
    })
  }
}
