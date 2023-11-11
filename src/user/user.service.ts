import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { SignupDto, LoginDto } from './dto/user.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/db/entity/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  //회원가입 (이메일 중복 -> 비밀번호 해싱 -> db 저장)
  async signup(signupDto: SignupDto) {
    const isSigned = await this.userRepo.findOne({
      select: ['email'],
      where: { email: signupDto.email },
    })

    if (isSigned) throw new HttpException('중복된 아이디', HttpStatus.BAD_REQUEST)

    try {
      const hashedPassword = await hashing(signupDto.password)
      signupDto.password = hashedPassword

      //todo 유효성 검사
      const result = await this.userRepo.insert(signupDto)
      return result
    } catch (e) {
      console.log(e)
      throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
    }
  }

  async login(loginDto: LoginDto) {
    const userInfo = await this.userRepo.findOne({
      select: ['id', 'password', 'name'],
      where: { email: loginDto.email },
    })

    console.log(userInfo)

    if (!userInfo) throw new HttpException('잘못된 로그인 정보', HttpStatus.NOT_FOUND)

    const isPwResult = await bcrypt.compare(loginDto.password, userInfo.password)

    if (!isPwResult) throw new HttpException('잘못된 로그인 정보', HttpStatus.NOT_FOUND)

    return //jwt
  }
}

const hashing = async (password: string) => {
  const saltNum = Number(process.env.SALT_ROUND) || 5
  const salt = await bcrypt.genSalt(saltNum)
  return bcrypt.hash(password, salt)
}
