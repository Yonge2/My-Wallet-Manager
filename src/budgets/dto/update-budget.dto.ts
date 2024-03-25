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
