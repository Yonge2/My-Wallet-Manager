import { Controller, Get, UseGuards } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser, UserInfo } from 'src/auth/get-user.decorator'

@Controller('stastics')
export class StasticsController {
  constructor(private readonly stasticsService: StasticsService) {}

  /**
   * 분모가 개인 데이터인 경우, 비교적 많지 않기 떄문에, 요청 시 처리한다.
   * 분모가 유저 전체 데이터인 경우, 비교적 많기 때문에, 배치 작업으로 미리 처리해놓는다.
   *
   * '/month' = 지난 달의 오늘 까지의 소비, 이번달의 오늘까지 소비 비교 통계
   * '/day' = 지난 요일의 소비, 오늘의 소비 비교 통계
   *
   * 분모는 배치작업 (다른 유저)
   * '/users' = 다른 유저 대비 나의 소비율 (이번달 오늘 까지 쓴 금액 / 이번 달 총 예산)
   */
  @UseGuards(JwtAuthGuard)
  @Get('/month')
  byMonth(@GetUser() getUser: UserInfo) {
    return this.stasticsService.byMonth(getUser)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/day')
  byDay(@GetUser() getUser: UserInfo) {
    return this.stasticsService.byDay(getUser)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users')
  byUsers(@GetUser() getUser: UserInfo) {
    return this.stasticsService.byUsers(getUser)
  }
}
