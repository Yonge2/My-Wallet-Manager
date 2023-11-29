import { Controller, Get, Param } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { User } from 'src/utils/user.decorator'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('통계 API')
@Controller('stastics')
export class StasticsController {
  constructor(private readonly stasticsService: StasticsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '통계 API', description: '분류 기준별 통계 보기' })
  @ApiParam({
    name: 'base',
    required: true,
    description: '통계 기준, month/week/user',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공(예시, 위험도)',
    schema: {
      example: {
        data: 150,
      },
    },
  })
  @ApiResponse({ status: 404, description: '통계조회 실패' })
  @ApiResponse({ status: 400, description: '통계조회 실패' })
  @Get(':base')
  byMonth(@User() user: JwtUserInfo, @Param('base') base: string) {
    if (base === 'month') return this.stasticsService.byMonth(user)
    else if (base === 'week') return this.stasticsService.byWeek(user)
    else if (base === 'user') return this.stasticsService.byUser(user)
    else return { message: '기준을 선택하세요' }
  }
}
