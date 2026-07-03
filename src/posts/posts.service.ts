import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    async create(dto: CreatePostDto, authorId: string): Promise<Post> {
        await this.cacheManager.clear();

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
        const cacheKey = `posts_${JSON.stringify(dto)}`;

        const cached = await this.cacheManager.get<{
            data: Post[];
            total: number;
            page: number;
            limit: number;
        }>(cacheKey);
        if (cached) {
            return cached;
        }

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

        const result = { data, total, page: currentPage, limit: currentLimit };

        await this.cacheManager.set(cacheKey, result, 60000); // 60 segundos

        return result;
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
        await this.cacheManager.clear();

        const post = await this.findOne(id);
        Object.assign(post, dto);
        return this.postsRepository.save(post);
    }

    async remove(id: string): Promise<void> {
        await this.cacheManager.clear();

        const post = await this.findOne(id);
        await this.postsRepository.remove(post);
    }

    async updateImage(id: string, imageUrl: string): Promise<Post> {
        await this.cacheManager.clear();

        const post = await this.findOne(id);
        post.imageUrl = imageUrl;
        return this.postsRepository.save(post);
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
}
