import { PartialType } from '@nestjs/swagger'
import { CreateBudgetDto } from './create-budget.dto'
import { IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateBudgetDto {
  @Type(() => Number)
  @IsNumber()
  totalAmount: number
}

export class UpdateBudgetCategoryDto {
  [category: string]: number
}
