import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    async create(dto: CreateCategoryDto): Promise<Category> {
        const exists = await this.categoriesRepository.findOneBy({
            name: dto.name,
        });
        if (exists)
            throw new ConflictException(
                'Ya existe una categoría con ese nombre',
            );

        const category = this.categoriesRepository.create(dto);
        return this.categoriesRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.find();
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findOneBy({ id });
        if (!category) throw new NotFoundException('Categoría no encontrada');
        return category;
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        Object.assign(category, dto);
        return this.categoriesRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);
        await this.categoriesRepository.remove(category);
    }
}
