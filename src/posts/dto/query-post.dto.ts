import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { PostStatus } from '../entities/post.entity';

export class QueryPostDto {
    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;

    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;
}
