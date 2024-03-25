import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { genSalt, hash } from 'bcrypt'
import { JoinDto } from './dto/join.dto'
import { AuthRepository } from './auth.repository'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: AuthRepository) {}

  async join(joinDto: JoinDto) {
    const isJoinable = await this.userRepository.isExistEmail(joinDto.email)
    if (!isJoinable) {
      throw new HttpException('이미 가입된 email 입니다.', HttpStatus.BAD_REQUEST)
    }

    const salt = await genSalt()
    joinDto.password = await hash(joinDto.password, salt)

    const joinResult = await this.userRepository.insertUser(joinDto)
    if (!joinResult) {
      throw new HttpException('가입실패, 다시시도해주세요', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      message: `${joinDto.name}님 가입이 완료되었습니다.`,
    }
  }
}
