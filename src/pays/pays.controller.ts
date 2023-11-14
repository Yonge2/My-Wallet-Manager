import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { PaysService } from './pays.service'
import { CreatePayDto } from './dto/create-pay.dto'
import { UpdatePayDto } from './dto/update-pay.dto'
import { User } from 'src/utils/user.decorator'
import { JwtUserInfo } from 'src/authorization/jwt.dto'

@Controller('pays')
export class PaysController {
  constructor(private readonly paysService: PaysService) {}

  @Post()
  @HttpCode(204)
  create(@User() user: JwtUserInfo, @Body() createPayDto: CreatePayDto) {
    return this.paysService.createPay(user, createPayDto)
  }

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.paysService.findPays(req, res)
  }

  @Get(':id')
  findOne(@User() user: JwtUserInfo, @Param('id') id: string) {
    return this.paysService.findPay(user, +id)
  }

  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @User() user: JwtUserInfo, @Body() updatePayDto: UpdatePayDto) {
    return this.paysService.updatePay(+id, user, updatePayDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: JwtUserInfo) {
    return this.paysService.removePay(+id, user)
  }
}
