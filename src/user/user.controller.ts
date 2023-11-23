import { Controller, Get, Post, Body, Header, HttpCode, Headers } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto, LoginDto } from './dto/user.dto'
import { AuthService } from './auth.service'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('사용자 API')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입', description: '사용자를 추가합니다.' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 401, description: '회원가입 실패' })
  signup(@Body() signupDto: SignupDto) {
    //todo signup
    return this.userService.signup(signupDto)
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인', description: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 404, description: '로그인 실패' })
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
