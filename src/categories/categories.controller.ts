import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser, UserInfo } from 'src/auth/get-user.decorator'

/**
 * 1/11
 * categories의 추가는 이후, 관리자 권한으로 하기.
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCategories() {
    return this.categoriesService.getCategory()
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createCategory(@GetUser() user: UserInfo, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(user, createCategoryDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteCategory(@GetUser() user: UserInfo, @Param('id') id: string) {
    return this.categoriesService.deleteCategory(user, +id)
  }
}
