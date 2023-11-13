import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'
import { CreatePayDto, GetWhereOption, InsertPayDto } from './dto/create-pay.dto'
import { UpdatePayDto } from './dto/update-pay.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { WalletHistory } from 'src/db/entity/wallet-history.entity'
import { Repository } from 'typeorm'

@Injectable()
export class PaysService {
  constructor(
    @InjectRepository(WalletHistory)
    private walletHistoryRepo: Repository<WalletHistory>,
  ) {}

  createPay = async (user: JwtUserInfo, createPayDto: CreatePayDto) => {
    const newPay = new InsertPayDto()
    newPay.user_id = user.id
    newPay.category = createPayDto.category
    newPay.memo = createPayDto.memo
    newPay.amount = Number(createPayDto.amount)

    try {
      const insertPay = await this.walletHistoryRepo.save(newPay)
      return
    } catch (e) {
      console.log(e)
      throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
    }
  }

  findPays = async (req: Request, res: Response) => {
    const userId = req['user'].id as number
    const querys = req.query
    const whereOption = getWhereOptions(querys, userId)
    console.log(whereOption)

    //페이징 및 기본값 설정해야함
    const a = await this.walletHistoryRepo
      .createQueryBuilder('wallet_history')
      .where('wallet_history.createdAt >= :start', { start: whereOption.start })
      .andWhere('wallet_history.createdAt <= :end', { end: whereOption.end })
      .andWhere('wallet_history.category = :category', { category: whereOption.category })
      .andWhere('wallet_history.amount <= :max', { max: whereOption.max })
      .andWhere('wallet_history.amount >= :min', { min: whereOption.min })
      .execute()

    console.log(a)
    res.status(200)
    return
  }

  findPay = async (user: JwtUserInfo, id: number) => {
    const whereOption = {
      user_id: user.id,
      id: id,
    }

    try {
      const detailHistory = await this.walletHistoryRepo.findOne({ where: whereOption })

      if (!detailHistory) {
        throw new HttpException('해당 내역 찾을 수 없음', HttpStatus.NOT_FOUND)
      }

      return detailHistory
    } catch (e) {
      throw new HttpException('해당 내역 찾을 수 없음', HttpStatus.NOT_FOUND)
    }
  }

  updatePay = async (id: number, user: JwtUserInfo, updatePayDto: UpdatePayDto) => {
    if (updatePayDto.amount) updatePayDto.amount = Number(updatePayDto.amount)

    try {
      const result = await this.walletHistoryRepo.update({ id: id, user_id: user.id }, updatePayDto)
      return
    } catch (e) {
      console.log(e)
      throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pay`
  }
}

const getWhereOptions = (querys: any, userId: number): GetWhereOption => {
  const whereOption: GetWhereOption = { user_id: userId }

  if (querys.start) whereOption.start = querys.start as Date
  if (querys.end) whereOption.end = querys.end as Date
  if (querys.max) whereOption.max = querys.max as number
  if (querys.min) whereOption.min = querys.min as number
  if (querys.category) whereOption.category = querys.category

  return whereOption
}
