import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

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
  expiresIn: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(input: AuthInput): Promise<SingInData | null> {
    const user = await this.userService.getUserByName(input.username);
    if (!user) {
      throw new HttpException(getReasonPhrase(StatusCodes.NOT_FOUND), StatusCodes.NOT_FOUND);
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return { userId: user.id, username: user.username};
  }

  async signIn(input: SingInData): Promise<AuthResult> {
    const { username, userId } = input;

    const tokenPayload = {
      userId,
      username,
    };
    
    try {
      const accessToken = await this.jwtService.signAsync(tokenPayload, { expiresIn: '3h' });
      return { accessToken, userId, username, expiresIn: '3h' };
    } catch (e) {
      console.error('JWT Error:', e);
      throw new InternalServerErrorException('Token generation failed');
    }
  }
}
