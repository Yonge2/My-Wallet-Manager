import { Injectable } from '@nestjs/common'
import { CreateBudgetDto, PostBudgetDto, UpdateBudgetDto, UpdatePostBudgetDto } from './dto/create-budget.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { Category } from './entities/budget.entity'
import { SetBudget } from 'src/db/entity/set-budget.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(SetBudget)
    private setBudgetRepo: Repository<SetBudget>,
  ) {}

  /**
   물리적으로 선언해놓은 키 반환
   */
  getCategory() {
    return Category
  }

  /**
   에러 핸들링 추가하기 
   */
  createBudget = async (user: JwtUserInfo, postBudgetDto: PostBudgetDto) => {
    const { totalAmount: _totalAmount, ...budgetField } = postBudgetDto

    const budget = new CreateBudgetDto()
    budget.user_id = user.id
    budget.total_amount = postBudgetDto.totalAmount
    budget.budget_field = budgetField

    const budgetInsert = await this.setBudgetRepo.insert(budget)
    return budgetInsert
  }

  /**
   에러 핸들링 추가할 것.
   */
  updateBudget = async (user: JwtUserInfo, postBudgetDto: UpdatePostBudgetDto) => {
    const { totalAmount: _totalAmount, ...budgetField } = postBudgetDto

    let updateSet: UpdateBudgetDto = {}
    if (postBudgetDto.totalAmount) updateSet.total_amount = postBudgetDto.totalAmount
    if (budgetField) updateSet.budget_field = budgetField

    const budgetInsert = await this.setBudgetRepo.update(user.id, updateSet)
    return budgetInsert
  }

  //todo
  recommendBudget = () => {}
}
