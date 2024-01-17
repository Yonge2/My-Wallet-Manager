import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetDto } from './dto/update-budget.dto'
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

  //개인 예산
  @UseGuards(JwtAuthGuard)
  @Get()
  getBudget(@GetUser() getUser: UserInfo) {
    return this.budgetsService.getBudget(getUser)
  }

  //개인 예산 변경
  @UseGuards(JwtAuthGuard)
  @Patch()
  updateBudget(@GetUser() getUser: UserInfo, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.updateBudget(getUser, updateBudgetDto)
  }
}
