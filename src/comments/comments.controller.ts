import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
    HttpCode,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('/posts/:postId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Body() dto: CreateCommentDto,
        @Param('postId') postId: string,
        @Req() req: any,
    ) {
        return this.commentsService.create(dto, postId, req.user.id);
    }

    @Get()
    findAll(@Param('postId') postId: string) {
        return this.commentsService.findAll(postId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.commentsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string, @Req() req: any) {
        return this.commentsService.remove(id, req.user.id, req.user.role);
    }
}
