import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode } from '@nestjs/common'
import { HistoriesService } from './histories.service'
import { HistoryDto } from './dto/create-history.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser, UserInfo } from 'src/auth/get-user.decorator'

@Controller('histories')
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createHistroy(@GetUser() getUser: UserInfo, @Body() createHistoryDto: HistoryDto) {
    return await this.historiesService.createHistory(getUser, createHistoryDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getHistories(@GetUser() getUser: UserInfo, @Query('page') page: string | number) {
    page = page == undefined ? 1 : Number(page)
    return await this.historiesService.getHistories(getUser, page)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getHistory(@GetUser() getUser: UserInfo, @Param('id') id: string) {
    return await this.historiesService.getHistory(getUser, +id)
  }

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateHistory(@GetUser() getUser: UserInfo, @Param('id') id: string, @Body() updateHistoryDto: HistoryDto) {
    return await this.historiesService.updateHistory(getUser, +id, updateHistoryDto)
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeHistory(@GetUser() getUser: UserInfo, @Param('id') id: string) {
    return await this.historiesService.removeHistory(getUser, +id)
  }
}
