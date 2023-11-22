import { Controller, Get, Param } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { User } from 'src/utils/user.decorator'
import { JwtUserInfo } from 'src/authorization/jwt.dto'

@Controller('stastics')
export class StasticsController {
  constructor(private readonly stasticsService: StasticsService) {}

  @Get(':base')
  byMonth(@User() user: JwtUserInfo, @Param('base') base: string) {
    if (base === 'month') return this.stasticsService.byMonth(user)
    else if (base === 'week') return this.stasticsService.byWeek(user)
    else if (base === 'user') return this.stasticsService.byUser(user)
    else return { message: '기준을 선택하세요' }
  }
}
