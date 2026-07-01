import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const hash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({ ...dto, password: hash });
        return this.signToken(user.id, user.email, user.role);
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        return this.signToken(user.id, user.email, user.role);
    }

    private signToken(sub: string, email: string, role: string) {
        return {
            access_token: this.jwtService.sign({ sub, email, role }),
        };
    }
}
