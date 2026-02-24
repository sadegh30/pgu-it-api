import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { saveImage } from './utils/file-utils';
import { sanitizeAndValidatePath } from './utils/path-sanitizer';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async createFileRecord(file: Express.Multer.File, body: UploadFileDto) {
    const safePath = sanitizeAndValidatePath(body.path);
    const fileName = await saveImage(file, safePath);

    return this.prisma.file.create({
      data: {
        filename: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: safePath,
        url: `/uploads/${safePath}/${fileName}`,
      },
    });
  }

  async deleteByUrl(fileUrl: string) {
    if (!fileUrl) return;

    const file = await this.prisma.file.findFirst({
      where: { url: fileUrl },
    });

    if (!file) return;

    const filePath = path.join(
      process.cwd(),
      'uploads',
      file.path,
      file.filename,
    );

    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await this.prisma.file.delete({
      where: { id: file.id },
    });
  }

  async markUsedByUrl(fileUrl: string) {
    if (!fileUrl) return;

    const file = await this.prisma.file.findFirst({
      where: { url: fileUrl },
    });

    if (!file) return;

    await this.prisma.file.update({
      where: { id: file.id },
      data: { used: true },
    });
  }

  withUrl(path?: string | null) {
    if (!path) return null;
    if (!path.startsWith('/uploads/')) return path;
    return `${process.env.API_URL}${path}`;
  }
}
