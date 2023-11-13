import { IsNumber } from 'class-validator'

export class CreateBudgetDto {
  user_id: number
  total_amount: number
  budget_field: {
    [category: string]: number
  }
}

export class PostBudgetDto {
  @IsNumber()
  totalAmount: number;
  [category: string]: number
}

export class UpdateBudgetDto {
  total_amount?: number
  budget_field?: {
    [category: string]: number
  }
}
export class UpdatePostBudgetDto {
  totalAmount?: number;
  [category: string]: number
}
