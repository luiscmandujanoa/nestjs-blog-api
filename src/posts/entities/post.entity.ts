import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column('text')
    content!: string;

    @Column({ unique: true })
    slug!: string;

    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
    status!: PostStatus;

    @ManyToOne(() => User, (user) => user.posts)
    author!: User;

    @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
    category!: Category;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments!: Comment[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
