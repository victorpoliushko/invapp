import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: "./tmpStorage",
      filename: ((req, file, cb) => {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSufix}${extname(file.originalname)}`);
      })
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      originalname: file.originalname,
      filename: file.filename
    }
  }
}
