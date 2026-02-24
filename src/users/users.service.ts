import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UpdateUserDto } from 'src/common/dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UsersQueryDto) {
    const { page = 1, perPage = 20, search, isActive } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.UserWhereInput = {
      role: Role.STUDENT,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        include: {
          userProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      total,
      page,
      perPage,
      data,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const server = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }
}
