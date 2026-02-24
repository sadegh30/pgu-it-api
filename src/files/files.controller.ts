import {
  BadRequestException,
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { FileSizeLimit } from './validators/file-validator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(`فرمت فایل معتبر نیست: ${file.mimetype}`),
            false,
          );
        }
      },
    }),
  )
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: FileSizeLimit })],
      }),
    )
    file: Express.Multer.File,
    @Body() body: UploadFileDto,
  ) {
    return await this.filesService.createFileRecord(file, body);
  }
}
