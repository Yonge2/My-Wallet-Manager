import { IsString } from 'class-validator'

export class JoinDto {
  @IsString()
  email: string

  @IsString()
  password: string

  @IsString()
  name: string
}
