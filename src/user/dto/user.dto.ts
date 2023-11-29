import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class SignupDto {
  @ApiProperty({
    example: 'dlwodyd25@naver.com',
    description: '유저 이메일',
    required: true,
  })
  @IsString()
  email: string

  @ApiProperty({
    example: 'test123#',
    description: '비밀번호',
    required: true,
  })
  @IsString()
  password: string

  @ApiProperty({
    example: 'Lee',
    description: '이름',
    required: true,
  })
  @IsString()
  name: string
}

export class LoginDto {
  @ApiProperty({
    example: 'dlwodyd25@naver.com',
    description: '유저 이메일',
    required: true,
  })
  @IsString()
  email: string

  @ApiProperty({
    example: 'test123#',
    description: '비밀번호',
    required: true,
  })
  @IsString()
  password: string
}
