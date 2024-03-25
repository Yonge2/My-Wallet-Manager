import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetCategoryDto, UpdateBudgetDto } from './dto/update-budget.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { GetUser, UserInfo } from '../auth/get-user.decorator'

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  //개인 예산 설정
  @UseGuards(JwtAuthGuard)
  @Post()
  createBudget(@GetUser() getUser: UserInfo, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.createBudget(getUser, createBudgetDto)
  }

  //개인 예산 조회
  @UseGuards(JwtAuthGuard)
  @Get()
  getBudget(@GetUser() getUser: UserInfo) {
    return this.budgetsService.getMyBudget(getUser)
  }

  /**개인 예산 변경
   * 총 예산과 부분 카테고리별 예산은 개별로 업데이트 가능하게끔 설계 (budget api, budget-category api)
   * -> 묶어서 optional로 개발하면, 복잡도가 높아지고 함수 독립성이 떨어짐.
   */
  @UseGuards(JwtAuthGuard)
  @Patch()
  updateBudget(@GetUser() getUser: UserInfo, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.updateBudget(getUser, updateBudgetDto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/category')
  updateBudgetCategory(@GetUser() getUser: UserInfo, @Body() updateBudgetCategoryDto: UpdateBudgetCategoryDto) {
    return this.budgetsService.updateBudgetCategory(getUser, updateBudgetCategoryDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/recommend')
  recommend() {
    return this.budgetsService.usersBudgetAverage()
  }
}
