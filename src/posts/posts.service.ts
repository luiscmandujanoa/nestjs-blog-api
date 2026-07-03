import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
    ) {}

    async create(dto: CreatePostDto, authorId: string): Promise<Post> {
        const slug = this.generateSlug(dto.title);

        const post = this.postsRepository.create({
            ...dto,
            slug,
            author: { id: authorId } as any,
            category: dto.categoryId
                ? ({ id: dto.categoryId } as any)
                : undefined,
        });

        return this.postsRepository.save(post);
    }

    async findAll(
        dto: QueryPostDto,
    ): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
        const { page, limit, status, search, categoryId } = dto;
        const currentPage = parseInt(page ?? '1');
        const currentLimit = parseInt(limit ?? '10');
        const skip = (currentPage - 1) * currentLimit;
        const take = currentLimit;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (categoryId) {
            where.category = { id: categoryId };
        }
        if (search) {
            where.title = ILike(`%${search}%`);
        }

        const [data, total] = await this.postsRepository.findAndCount({
            where,
            relations: { author: true, category: true },
            skip,
            take,
        });

        return {
            data,
            total,
            page: currentPage,
            limit: currentLimit,
        };
    }

    async findOne(id: string): Promise<Post> {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: { author: true, category: true },
        });
        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }
        return post;
    }

    async update(id: string, dto: UpdatePostDto): Promise<Post> {
        const post = await this.findOne(id);
        Object.assign(post, dto);
        return this.postsRepository.save(post);
    }

    async remove(id: string): Promise<void> {
        const post = await this.findOne(id);
        await this.postsRepository.remove(post);
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
}
