import { IsOptional, IsString } from 'class-validator'

export class HistoryDto {
  @IsOptional()
  @IsString()
  memo?: string

  @IsOptional()
  @IsString()
  imageUrl?: string;

  //category : amount
  [category: string]: string
}
