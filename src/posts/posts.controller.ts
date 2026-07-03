import {
    Controller,
    Get,
    Post as HttpPost,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { QueryPostDto } from './dto/query-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from 'src/images/images.service';
import { memoryStorage } from 'multer';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly imagesService: ImagesService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'editor')
    @HttpPost()
    create(@Body() dto: CreatePostDto, @Req() req: any) {
        return this.postsService.create(dto, req.user.id);
    }

    @Get()
    findAll(@Query() query: QueryPostDto) {
        return this.postsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'editor')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.postsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'editor')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.postsService.remove(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'editor')
    @HttpPost(':id/image')
    @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
    async uploadImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const result = await this.imagesService.uploadImage(file);
        return this.postsService.updateImage(id, result.secure_url);
    }
}
