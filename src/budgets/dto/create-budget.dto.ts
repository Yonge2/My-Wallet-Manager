import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class CreateBudgetDto {
  @Type(() => Number)
  @IsNumber()
  totalAmount: number;

  [category: string]: number
}
