import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { generateTempPassword } from '../common/utils/createTemp-pass';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(data: CreateUserDto, user: any, role: "INTERN" | "MENTOR") {
    const { name, email } = data;

    const existing = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException("User With This Email Already Exists !!");
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: user.companyId,
        isActive: true,
      },
    });

    return {
      message: `${role} Created Successfully`,
      credentials: {
        email,
        password: tempPassword,
      },
    };
  }
}
