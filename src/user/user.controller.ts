import { Controller, Get, Post, Body, Header, HttpCode, Headers } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto, LoginDto } from './dto/user.dto'
import { AuthService } from './auth.service'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  signup(@Body() signupDto: SignupDto) {
    //todo signup
    return this.userService.signup(signupDto)
  }

  @Post('/login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto)
  }

  @Get('/auth/access')
  recreateAccessToken(@Headers('authorization') authorization: string, @Headers('refresh') refresh: string) {
    return this.authService.createNewAccessToken(authorization, refresh)
  }

  @Get('/auth/refresh')
  recreateRefreshToken(@Headers('authorization') authorization: string, @Headers('refresh') refresh: string) {
    return this.authService.createNewRefreshToken(authorization, refresh)
  }
}
