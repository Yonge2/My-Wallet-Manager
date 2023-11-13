import { OmitType } from '@nestjs/mapped-types'

export class InsertPayDto {
  category: string
  amount: number
  memo: string
  user_id: number
}

export class CreatePayDto extends OmitType(InsertPayDto, ['user_id'] as const) {}

export interface GetWhereOption {
  user_id: number
  start?: Date
  end?: Date
  max?: number
  min?: number
  category?: string
}
