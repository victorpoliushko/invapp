import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(() => {
    controller = new UploadController();
  });

  describe('uploadFile', () => {
    it('returns the original and generated file names from the uploaded file', () => {
      const file = {
        originalname: 'photo.png',
        filename: 'file-1234567890.png',
      } as Express.Multer.File;

      const result = controller.uploadFile(file);

      expect(result).toEqual({
        originalname: 'photo.png',
        filename: 'file-1234567890.png',
      });
    });
  });
});
