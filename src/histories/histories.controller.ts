import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode } from '@nestjs/common'
import { HistoriesService } from './histories.service'
import { CreateHistoryDto } from './dto/create-history.dto'
import { UpdateHistoryDto } from './dto/update-history.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser, UserInfo } from 'src/auth/get-user.decorator'

@Controller('histories')
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createHistroy(@GetUser() getUser: UserInfo, @Body() createHistoryDto: CreateHistoryDto) {
    return await this.historiesService.createHistory(getUser, createHistoryDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getHistories(@GetUser() getUser: UserInfo, @Query('page') page: string) {
    return await this.historiesService.getHistories(getUser, +page)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getHistory(@GetUser() getUser: UserInfo, @Param('id') id: string) {
    return await this.historiesService.getHistory(getUser, +id)
  }

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateHistory(
    @GetUser() getUser: UserInfo,
    @Param('id') id: string,
    @Body() updateHistoryDto: UpdateHistoryDto,
  ) {
    return await this.historiesService.updateHistory(getUser, +id, updateHistoryDto)
  }

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteHistory(@GetUser() getUser: UserInfo, @Param('id') id: string) {
    return await this.historiesService.deleteHistory(getUser, +id)
  }
}
