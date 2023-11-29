import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto, PostBudgetDto, UpdatePostBudgetDto } from './dto/create-budget.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { User } from 'src/utils/user.decorator'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('budgets API')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  //카테고리 목록
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 목록', description: '현재 사용하고 있는 카테고리 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '예산 수정 성공',
    schema: {
      example: {
        data: ['식비', '주거비', '음료비', '유흥비', '기타'],
      },
    },
  })
  @ApiResponse({ status: 401, description: '카테고리 목록 조회 실패' })
  @Get('/category')
  findAll() {
    return this.budgetsService.getCategory()
  }

  //예산 설정
  @ApiBearerAuth()
  @ApiOperation({ summary: '예산 등록', description: '총 예산 등록' })
  @ApiBody({ type: PostBudgetDto })
  @ApiResponse({
    status: 201,
    description: '예산 등록 성공',
  })
  @ApiResponse({ status: 401, description: '예산 등록 실패' })
  @Post()
  create(@User() user: JwtUserInfo, @Body() postBudgetDto: PostBudgetDto) {
    return this.budgetsService.createBudget(user, postBudgetDto)
  }

  //예산 설정 수정
  @ApiBearerAuth()
  @ApiOperation({ summary: '예산 수정', description: '총 예산 수정' })
  @ApiBody({ type: UpdatePostBudgetDto })
  @ApiResponse({
    status: 204,
    description: '예산 수정 성공',
  })
  @ApiResponse({ status: 401, description: '지출 등록 실패' })
  @HttpCode(204)
  @Put()
  update(@User() user: JwtUserInfo, @Body() updateBudgetDto: UpdatePostBudgetDto) {
    return this.budgetsService.updateBudget(user, updateBudgetDto)
  }

  //예산 설정 추천
  @ApiBearerAuth()
  @ApiOperation({ summary: '예산 추천', description: '캐시에 저장된 모든 유저의 평균 비율을 계산하여 리턴' })
  @ApiResponse({
    status: 200,
    description: '예산 추천 내역',
    schema: {
      example: {
        주거비: 50,
        식비: 30,
        기타: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: '예산 추천 실패' })
  @ApiResponse({ status: 404, description: '예산 추천 실패' })
  @Get('/recommend')
  recommend() {
    return this.budgetsService.recommendBudget()
  }
}
