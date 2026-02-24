import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { WebsitesQueryDto } from './dto/websites-query.dto';
import { WebsitesService } from './websites.service';

@Controller('websites')
export class UserWebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Get()
  @ApiOperation({ summary: 'لیست وبسایت‌های فعال برای کاربران' })
  async findAll(@Query() query: WebsitesQueryDto) {
    return this.websitesService.findAllUser(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک وبسایت فعال بر اساس id' })
  findOne(@Param('id') id: string) {
    return this.websitesService.findOneUser(id);
  }
}
