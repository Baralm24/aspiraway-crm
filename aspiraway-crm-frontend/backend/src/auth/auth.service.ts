import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from './hash';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await comparePassword(password, user.password);
    if (!valid) return null;

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.roleId };
    return {
      access_token: jwt.sign(payload, 'YOUR_SECRET_KEY', { expiresIn: '1d' }),
    };
  }
}
