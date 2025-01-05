import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

export type AuthInput = {
  username: string;
  password: string;
};

type SingInData = {
  userId: string;
  username: string;
};

type AuthResult = {
  accessToken: string;
  userId: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      accessToken: 'fake-token',
      userId: user.userId,
      username: user.username
    }
  }

  async validateUser(input: AuthInput): Promise<SingInData | null> {
    const user = await this.userService.findUserByName(input.username);
    if (user && user.password === input.password) return {
      userId: user.userId,
      username: user.username
    }
    return null;
  }
}
