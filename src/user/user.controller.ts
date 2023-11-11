import { Controller, Get, Post, Body, Header } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto, LoginDto } from './dto/user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  signup(@Body() signupDto: SignupDto) {
    //todo signup
    return this.userService.signup(signupDto)
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto)
  }

  //todo jwt
  @Get('/auth/access')
  @Header('user', 'jwtPayload')
  recreateAccessToken() {}

  @Get('/auth/refresh')
  @Header('user', 'jwtPayload')
  recreateRefreshToken() {}
}
