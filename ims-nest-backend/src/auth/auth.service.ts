import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) { }

  async register(data: RegisterDto) {
    const { name, email, password } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: {
        name, email, password: hashPassword, role: 'PUBLIC_USER',
      }
    })

    return {
      message: 'User registered successfully',
      user,
    };

  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive Contact Admin!');
    }

    const token = this.jwt.sign({
      sub: user.id,
      role: user.role,
      companyId: user.companyId
    })

    return {
      message: 'Login successful',
      access_token: token,
    };
  }

}