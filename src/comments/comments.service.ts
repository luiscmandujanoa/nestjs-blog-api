import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentsRepository: Repository<Comment>,
    ) {}

    async create(
        dto: CreateCommentDto,
        postId: string,
        authorId: string,
    ): Promise<Comment> {
        const comment = this.commentsRepository.create({
            ...dto,
            post: { id: postId } as any,
            author: { id: authorId } as any,
        });

        return this.commentsRepository.save(comment);
    }

    async findAll(postId: string): Promise<Comment[]> {
        return this.commentsRepository.find({
            relations: { author: true, post: true },
            where: { post: { id: postId } },
        });
    }

    async findOne(id: string): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: { author: true, post: true },
        });
        if (!comment) {
            throw new NotFoundException('Comment no encontrado');
        }
        return comment;
    }

    async remove(id: string, userId: string, userRole: string): Promise<void> {
        const comment = await this.findOne(id);

        const isAuthor = comment.author.id === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException(
                'No tienes permiso para eliminar este comentario',
            );
        }
        await this.commentsRepository.remove(comment);
    }
}
