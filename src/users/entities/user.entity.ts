import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Exclude } from 'class-transformer';
import { Comment } from '../../comments/entities/comment.entity';

export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    @Exclude()
    password!: string;

    @Column()
    name!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => Comment, (comment) => comment.author)
    comments!: Comment[];

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => Post, (post) => post.author)
    posts!: Post[];
}
