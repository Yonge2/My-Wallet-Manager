import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { PaysService } from './pays.service'
import { CreatePayDto, GetWhereOption } from './dto/create-pay.dto'
import { UpdatePayDto } from './dto/update-pay.dto'
import { User } from 'src/utils/user.decorator'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('pays API')
@Controller('pays')
export class PaysController {
  constructor(private readonly paysService: PaysService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '지출 등록', description: '지출 내역 등록' })
  @ApiBody({ type: CreatePayDto })
  @ApiResponse({
    status: 204,
    description: '지출 등록 성공',
  })
  @ApiResponse({ status: 401, description: '지출 등록 실패' })
  @Post()
  @HttpCode(204)
  create(@User() user: JwtUserInfo, @Body() createPayDto: CreatePayDto) {
    return this.paysService.createPay(user, createPayDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '지출 조회', description: '전체 지출 내역 보기' })
  @ApiResponse({
    status: 200,
    description: '지출 조회 성공',
    schema: {
      example: {
        category: '주거비',
        amount: 30000,
        createdAt: '2023-11-11...',
      },
    },
  })
  @ApiResponse({ status: 404, description: '지출조회 실패' })
  @ApiResponse({ status: 400, description: '지출조회 실패' })
  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.paysService.findPays(req, res)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '상세 지출 내역', description: '상세 지출 내역 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '지출 내역 id',
  })
  @ApiResponse({
    status: 200,
    description: '지출 상세 내역 조회 성공',
    schema: {
      example: {
        id: 1,
        category: '주거비',
        amount: 30000,
        memo: '주거비 상세 내용',
        createdAt: '2023-11-11 ...',
        user_id: 3,
      },
    },
  })
  @ApiResponse({ status: 404, description: '지출 상세 내역 조회 실패' })
  @ApiResponse({ status: 400, description: '지출 상세 내역 조회 실패' })
  @Get(':id')
  findOne(@User() user: JwtUserInfo, @Param('id') id: string) {
    return this.paysService.findPay(user, +id)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '상세 지출 내역', description: '상세 지출 내역 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '지출 내역 id',
  })
  @ApiResponse({
    status: 204,
    description: '지출 내역 수정 성공',
  })
  @ApiResponse({ status: 404, description: '지출 내역 수정 실패' })
  @ApiResponse({ status: 400, description: '지출 내역 수정 실패' })
  @Put(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @User() user: JwtUserInfo, @Body() updatePayDto: UpdatePayDto) {
    return this.paysService.updatePay(+id, user, updatePayDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '상세 지출 내역', description: '상세 지출 내역 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '지출 내역 id',
  })
  @ApiResponse({
    status: 204,
    description: '지출 내역 삭제 성공',
  })
  @ApiResponse({ status: 404, description: '지출 삭제 실패' })
  @ApiResponse({ status: 400, description: '지출 삭제 실패' })
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: JwtUserInfo) {
    return this.paysService.removePay(+id, user)
  }
}
