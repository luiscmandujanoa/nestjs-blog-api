import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
};

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => jest.clearAllMocks());

    describe('login', () => {
        it('debería retornar un token si las credenciales son válidas', async () => {
            const user = {
                id: '1',
                email: 'test@test.com',
                role: 'user',
                password: await bcrypt.hash('123456', 10),
            };
            mockUsersService.findByEmail.mockResolvedValue(user);

            const result = await authService.login({
                email: 'test@test.com',
                password: '123456',
            });

            expect(result).toEqual({ access_token: 'test-token' });
        });

        it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                authService.login({
                    email: 'noexiste@test.com',
                    password: '123456',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
            const user = {
                id: '1',
                email: 'test@test.com',
                role: 'user',
                password: await bcrypt.hash('123456', 10),
            };
            mockUsersService.findByEmail.mockResolvedValue(user);

            await expect(
                authService.login({
                    email: 'test@test.com',
                    password: 'wrongpassword',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
