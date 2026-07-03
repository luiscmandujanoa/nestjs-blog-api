import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { ImagesModule } from '../images/images.module';

@Module({
    imports: [TypeOrmModule.forFeature([Post]), ImagesModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
