import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { NotFoundException } from '@nestjs/common';

const mockPostsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
};

const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
};

describe('PostsService', () => {
    let postsService: PostsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: getRepositoryToken(Post),
                    useValue: mockPostsRepository,
                },
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
            ],
        }).compile();

        postsService = module.get<PostsService>(PostsService);
    });

    afterEach(() => jest.clearAllMocks());

    describe('findOne', () => {
        it('debería retornar un post por id', async () => {
            const post = { id: '1', title: 'Test post' };
            mockPostsRepository.findOne.mockResolvedValue(post);

            const result = await postsService.findOne('1');

            expect(result).toEqual(post);
        });

        it('debería lanzar NotFoundException si el post no existe', async () => {
            mockPostsRepository.findOne.mockResolvedValue(null);

            await expect(postsService.findOne('999')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('create', () => {
        it('debería crear un nuevo post', async () => {
            const dto = {
                title: 'New Post',
                content: 'Content',
                categoryId: '1',
            };
            const authorId = 'author-1';
            const createdPost = {
                id: '1',
                ...dto,
                slug: 'new-post',
                author: { id: authorId },
            };
            mockPostsRepository.create.mockReturnValue(createdPost);
            mockPostsRepository.save.mockResolvedValue(createdPost);

            const result = await postsService.create(dto, authorId);

            expect(result).toEqual(createdPost);

            expect(mockCacheManager.clear).toHaveBeenCalled();
        });
    });
});
