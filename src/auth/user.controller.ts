import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common'
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
