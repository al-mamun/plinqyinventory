import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.app_user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.app_user.create({
      data: {
        email: createUserDto.email,
        password_hash: hashedPassword,
        full_name: createUserDto.name,
        role: createUserDto.role || 'customer',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.app_user.findUnique({
      where: { email },
      include: {
        store: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.app_user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.app_user.update({
      where: { id },
      data,
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.app_user.update({
      where: { id },
      data: {
        last_login_at: new Date(),
      },
    });
  }
}
