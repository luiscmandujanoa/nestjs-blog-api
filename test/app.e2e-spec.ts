import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestDatabaseModule } from './setup-e2e';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideModule(TypeOrmModule)
            .useModule(TestDatabaseModule)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();
        dataSource = moduleFixture.get(DataSource);

        console.log('BD conectada:', dataSource.options.database);
    });

    beforeEach(async () => {
        console.log('Limpiando BD...');
        await dataSource.query('SET session_replication_role = replica;');
        await dataSource.query(
            'TRUNCATE TABLE comments, posts, categories, users RESTART IDENTITY CASCADE;',
        );
        await dataSource.query('SET session_replication_role = DEFAULT;');
        console.log('BD limpia');

        // usuario base para tests que lo necesiten
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'base@test.com', password: '123456', name: 'Base' });
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /auth/register - debería registrar un usuario', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'nuevo@test.com',
                password: '123456',
                name: 'Nuevo',
            }); // email diferente

        console.log('Response:', res.status, res.body);
        expect(res.status).toBe(201);
    });

    it('POST /auth/login - debería retornar un token', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'base@test.com', password: '123456' }) // usa el usuario base
            .expect(201)
            .expect((res) => {
                expect(res.body.access_token).toBeDefined();
            });
    });
});
