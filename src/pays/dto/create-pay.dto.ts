import { OmitType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class InsertPayDto {
  @ApiProperty({
    example: '주거비',
    description: '지출 카테고리',
    required: true,
  })
  @IsString()
  category: string

  @ApiProperty({
    example: 30000,
    description: '지출 금액',
    required: true,
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    example: '월세 지출',
    description: '상세 내용',
    required: true,
  })
  @IsString()
  memo: string

  @IsNumber()
  user_id: number
}

export class CreatePayDto extends OmitType(InsertPayDto, ['user_id'] as const) {}

export class GetWhereOption {
  @ApiProperty({
    example: '2023-11-11',
    description: '날짜 이상 필터링 옵션',
    required: false,
  })
  start?: string

  @ApiProperty({
    example: '2023-11-11',
    description: '날짜 이하 필터링 옵션',
    required: false,
  })
  end?: string

  @ApiProperty({
    example: 10000,
    description: '금액 이상 필터링 옵션',
    required: false,
  })
  max?: number

  @ApiProperty({
    example: 10000,
    description: '금액 이하 필터링 옵션',
    required: false,
  })
  min?: number

  @ApiProperty({
    example: '월세 지출',
    description: '상세 내용',
    required: false,
  })
  category?: string

  @ApiProperty({
    example: 1,
    description: '페이지, default = 0',
    required: false,
  })
  page?: number
}
