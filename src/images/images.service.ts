import 'multer';
import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class ImagesService {
    constructor(@Inject('CLOUDINARY') private cloudinary) {}

    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'blog-api' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result!);
                },
            );

            Readable.from(file.buffer).pipe(upload);
        });
    }
}
