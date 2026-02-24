// utils/file-utils.ts
import * as mkdirp from 'mkdirp';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const saveImage = async (file: Express.Multer.File, path: string) => {
  const destination = 'uploads/' + path;
  const fileName = `${Date.now()}-${uuidv4()}-${file.originalname}`;

  mkdirp.sync(destination);

  try {
    await sharp(file.buffer).toFile(destination + '/' + fileName);
    return fileName;
  } catch (err) {
    console.error('Error saving image:', err);
    throw new Error('خطا در ذخیره فایل');
  }
};
