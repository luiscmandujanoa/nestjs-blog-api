import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from './comments/comments.module';
import { ImagesModule } from './images/images.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
            }),
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                store: 'ioredis',
                host: config.get('REDIS_HOST', 'localhost'),
                port: config.get<number>('REDIS_PORT', 6379),
            }),
        }),
        PrometheusModule.register({
            defaultMetrics: {
                enabled: true,
            },
        }),
        UsersModule,
        AuthModule,
        PostsModule,
        CategoriesModule,
        CommentsModule,
        ImagesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
