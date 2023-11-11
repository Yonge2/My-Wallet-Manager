import { IsString, IsNumber, IsOptional } from 'class-validator'

export class SignupDto {
  @IsString()
  email: string

  @IsString()
  password: string

  @IsString()
  name: string
}

export class LoginDto {
  @IsString()
  email: string

  @IsString()
  password: string
}
