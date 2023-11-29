import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class CreateBudgetDto {
  user_id: number
  total_amount: number
  budget_field: {
    [category: string]: number
  }
}

export class PostBudgetDto {
  @ApiProperty({
    example: 100000,
    description: '한달 간 사용할 총 예산',
    required: true,
  })
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
