import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsitesQueryDto } from './dto/websites-query.dto';
import { WebsitesService } from './websites.service';

@Controller('admin/websites')
@Roles(Role.ADMIN, Role.SUPPORT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminWebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Get()
  @ApiOperation({ summary: 'لیست کامل وبسایت‌ها (ادمین)' })
  async findAll(@Query() query: WebsitesQueryDto) {
    return this.websitesService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک وبسایت بر اساس ID (ادمین)' })
  findOne(@Param('id') id: string) {
    return this.websitesService.findOneAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'افزودن وبسایت جدید' })
  create(@Body() dto: CreateWebsiteDto) {
    return this.websitesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش وبسایت' })
  @ApiParam({ name: 'id', example: 'ckxyz...' })
  update(@Param('id') id: string, @Body() dto: UpdateWebsiteDto) {
    return this.websitesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف وبسایت' })
  @ApiParam({ name: 'id', example: 'ckxyz...' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.websitesService.remove(id);
  }
}
