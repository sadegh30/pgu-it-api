// src/websites/websites.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsitesQueryDto } from './dto/websites-query.dto';

@Injectable()
export class WebsitesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  /** ------------------ Admin Methods ------------------ **/

  async findAllAdmin(query: WebsitesQueryDto) {
    const { page = 1, perPage = 20, search, isActive } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.WebsiteWhereInput = { isDeleted: false };

    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { helper: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [websites, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.website.count({ where }),
    ]);

    const data = websites.map((website) => ({
      ...website,
      imageUrl: this.filesService.withUrl(website.imageUrl),
    }));

    return { total, page, perPage, data };
  }

  async findOneAdmin(id: string) {
    const website = await this.prisma.website.findFirst({
      where: { id, isDeleted: false },
    });
    if (!website) throw new NotFoundException('وبسایت مورد نظر یافت نشد');

    return {
      ...website,
      imageUrl: this.filesService.withUrl(website.imageUrl),
    };
  }

  async create(dto: CreateWebsiteDto) {
    if (dto.imageUrl) await this.filesService.markUsedByUrl(dto.imageUrl);

    return this.prisma.website.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateWebsiteDto) {
    const website = await this.prisma.website.findFirst({
      where: { id, isDeleted: false },
    });
    if (!website) throw new NotFoundException('وبسایت مورد نظر یافت نشد');

    const data: Prisma.WebsiteUpdateInput = { ...dto };

    if (dto.imageUrl && dto.imageUrl !== website.imageUrl) {
      if (website.imageUrl)
        await this.filesService.deleteByUrl(website.imageUrl);
      await this.filesService.markUsedByUrl(dto.imageUrl);
    }

    return this.prisma.website.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const website = await this.prisma.website.findFirst({
      where: { id, isDeleted: false },
    });
    if (!website) throw new NotFoundException('وبسایت مورد نظر یافت نشد');

    return this.prisma.website.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  /** ------------------ User Methods ------------------ **/

  async findAllUser(query: WebsitesQueryDto) {
    const { page = 1, perPage = 20, search } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.WebsiteWhereInput = {
      isDeleted: false,
      isActive: true,
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { helper: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [websites, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.website.count({ where }),
    ]);

    const data = websites.map((w) => ({
      ...w,
      imageUrl: this.filesService.withUrl(w.imageUrl),
    }));

    return { total, page, perPage, data };
  }

  async findOneUser(id: string) {
    const website = await this.prisma.website.findFirst({
      where: { id, isDeleted: false, isActive: true },
    });

    if (!website) throw new NotFoundException('وبسایت مورد نظر یافت نشد');

    return {
      ...website,
      imageUrl: this.filesService.withUrl(website.imageUrl),
    };
  }
}
