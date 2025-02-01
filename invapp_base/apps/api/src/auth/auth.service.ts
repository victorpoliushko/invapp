import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.signIn(user);
  }

  async validateUser(input: AuthInput): Promise<SingInData | null> {
    const user = await this.userService.findUserByName(input.username);
    console.log('user: ', user)
    if (user && user.password === input.password)
      return {
        userId: user._id,
        username: user.username,
      };
    return null;
  }

  async signIn(input: SingInData): Promise<AuthResult> {
    const { username, userId } = input;
    const tokenPayload = {
      sub: input.userId,
      username,
    };
    
    try {
      const accessToken = await this.jwtService.signAsync(tokenPayload);
      return { accessToken, userId, username };
    } catch (e) {
      console.log('Error during token generation: ', e.message, e.stack);
      throw new Error('Failed to generate token');
    }
  }
}
