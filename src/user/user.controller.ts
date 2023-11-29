import { Controller, Get, Post, Body, Header, HttpCode, Headers } from '@nestjs/common'
import { UserService } from './user.service'
import { SignupDto, LoginDto } from './dto/user.dto'
import { AuthService } from './auth.service'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

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
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      example: {
        message: '회원가입 성공',
      },
    },
  })
  @ApiResponse({ status: 401, description: '회원가입 실패' })
  signup(@Body() signupDto: SignupDto) {
    return this.userService.signup(signupDto)
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인', description: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        accessToken: 'dddd',
        refreshToken: 'dddd',
      },
    },
  })
  @ApiResponse({ status: 404, description: '로그인 실패' })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'accessToken 재발급', description: 'accessToken 재발급' })
  @ApiResponse({
    status: 200,
    description: '재발급 성공',
    schema: {
      example: {
        accessToken: 'dddd',
      },
    },
  })
  @ApiResponse({ status: 401, description: '재발급 실패' })
  @Get('/auth/access')
  recreateAccessToken(@Headers('authorization') authorization: string, @Headers('refresh') refresh: string) {
    return this.authService.createNewAccessToken(authorization, refresh)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'refreshToken 재발급', description: 'refreshToken 재발급' })
  @ApiResponse({
    status: 200,
    description: '재발급 성공',
    schema: {
      example: {
        refreshToken: 'dddd',
      },
    },
  })
  @ApiResponse({ status: 401, description: '재발급 실패' })
  @Get('/auth/refresh')
  recreateRefreshToken(@Headers('authorization') authorization: string, @Headers('refresh') refresh: string) {
    return this.authService.createNewRefreshToken(authorization, refresh)
  }
}
