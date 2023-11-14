import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'
import { CreatePayDto, GetWhereOption, InsertPayDto } from './dto/create-pay.dto'
import { UpdatePayDto } from './dto/update-pay.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { WalletHistory } from 'src/db/entity/wallet-history.entity'
import { Repository } from 'typeorm'
import * as dayjs from 'dayjs'

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
      if (!insertPay) throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
      return
    } catch (e) {
      console.log(e)
      throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
    }
  }

  findPays = async (req: Request, res: Response) => {
    const userId = req['user'].id as number
    const querys = req.query
    const { start, end, max, min, category, page } = getWhereOptions(querys)

    try {
      const pays = this.walletHistoryRepo
        .createQueryBuilder()
        .select(['category as category', 'amount as amount', 'createdAt as createdAt'])
        .where('user_id = :userId', { userId })
        .andWhere('createdAt >= :start', { start })
        .andWhere('createdAt <= :end', { end })
        .andWhere('amount <= :max', { max })
        .andWhere('amount >= :min', { min })

      if (category) {
        pays.andWhere('category = :category', { category: category })
      }

      const result = await pays
        .offset((page - 1) * 20)
        .limit(20)
        .execute()

      res.status(200).json({ body: result })
    } catch (e) {
      console.log('getPays err ', e)
      res.status(400).json({ error: '잘못된 요청' })
    }
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

  removePay = async (id: number, user: JwtUserInfo) => {
    try {
      const deleteResult = await this.walletHistoryRepo.delete({ id: id, user_id: user.id })

      if (!deleteResult) throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)

      return
    } catch (e) {
      console.log(e)
      throw new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST)
    }
  }
}

const getWhereOptions = (querys: any): GetWhereOption => {
  //2023-11-13 22:16:04
  return {
    //default 7 days
    end: querys.end ? querys.end : dayjs().format('YYYY-MM-DD'),
    start: querys.start ? querys.start : dayjs().subtract(7, 'd').format('YYYY-MM-DD'),

    //defualt 0~100만
    max: querys.max ? +querys.max : 1000000,
    min: querys.min ? +querys.min : 0,

    category: querys.category ? querys.category : undefined,

    page: querys.page ? +querys.page : 1,
  }
}
