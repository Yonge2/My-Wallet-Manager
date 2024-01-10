import { Controller, Request, Post, UseGuards, Body, Get, Header } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JoinDto } from './dto/join.dto'
import { UserService } from './user.service'

@Controller()
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('join')
  async join(@Body() joinDto: JoinDto) {
    return this.userService.join(joinDto)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('refresh')
  async refresh(@Request() req: any) {
    const refreshToken = req.headers.refreshtoken
    return this.authService.recreateAccessToken(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
