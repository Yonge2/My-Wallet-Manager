import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser, UserInfo } from 'src/auth/get-user.decorator'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('통계 API')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '통계 API', description: '분류 기준별 통계 보기' })
  @ApiParam({
    name: 'method',
    required: true,
    description: '통계 기준, 방법',
    example: {
      method: 'month',
    },
  })
  @ApiResponse({
    status: 200,
    description:
      '통계 조회 성공 {category: 세부 예산 항목, thisMonthPerLastMonth: 이번달 쓴 금액/지난달 쓴 금액 * 100 (%)}[]',
    schema: {
      example: [
        {
          category: '주거비',
          thisMonthPerLastMonth: 100,
        },
        {
          category: '식비',
          thisMonthPerLastMonth: 150,
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '통계조회 실패' })
  @ApiResponse({ status: 400, description: '통계조회 실패' })
  @UseGuards(JwtAuthGuard)
  @Get(':method')
  byMonth(@GetUser() getUser: UserInfo, @Param('method') method: string) {
    return this.stasticsService.paidStastics(getUser, method)
  }
}
