import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto, PostBudgetDto, UpdatePostBudgetDto } from './dto/create-budget.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { User } from 'src/utils/user.decorator'

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  //카테고리 목록
  @Get('/category')
  findAll() {
    return this.budgetsService.getCategory()
  }

  //예산 설정
  @Post()
  create(@User() user: JwtUserInfo, @Body() postBudgetDto: PostBudgetDto) {
    return this.budgetsService.createBudget(user, postBudgetDto)
  }

  //예산 설정 수정
  @Put()
  update(@User() user: JwtUserInfo, @Body() updateBudgetDto: UpdatePostBudgetDto) {
    return this.budgetsService.updateBudget(user, updateBudgetDto)
  }

  @Get('/recommend')
  recommend() {
    return this.budgetsService.recommendBudget()
  }
}
