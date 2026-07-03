import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CloudinaryProvider } from '../config/cloudinary.config';

@Module({
    providers: [ImagesService, CloudinaryProvider],
    exports: [ImagesService],
})
export class ImagesModule {}
