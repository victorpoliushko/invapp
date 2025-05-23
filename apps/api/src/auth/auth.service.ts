import { HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import refreshJwtConfig from '../config/refresh-jwt-config';
import { ConfigType } from '@nestjs/config';
import { jwtConstants } from './constants';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/current-user';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';

export type AuthInput = {
  username: string;
  password: string;
};

type SignInData = {
  userId: string;
  username: string;
};

type AuthResult = {
  accessToken: string;
  userId: string;
  username: string;
  expiresIn: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,

    @Inject(refreshJwtConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
  ) {}

  async validateUser(input: AuthInput): Promise<SignInData | null> {
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

  async signIn(input: SignInData): Promise<AuthResult> {
    const { username, userId } = input;
    
    try {
      const { accessToken, refreshToken } = await this.generateToken(input);
      const hashedRefreshToken = await argon2.hash(refreshToken);
      await this.userService.updateHashedResfreshToken(userId, hashedRefreshToken);
      return { accessToken, refreshToken, userId, username, expiresIn: jwtConstants.expireIn };
    } catch (e) {
      console.error('JWT Error:', e);
      throw new InternalServerErrorException('Token generation failed');
    }
  }

  async generateToken(input: SignInData) {
    const { username, userId } = input;

    const tokenPayload = {
      userId,
      username
    }

    const [ accessToken, refreshToken ] = await Promise.all([
      await this.jwtService.signAsync(tokenPayload, { expiresIn: jwtConstants.expireIn }),
      await this.jwtService.signAsync(tokenPayload, this.refreshTokenConfig)
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(input: SignInData) {
    const { username, userId } = input;

    const { accessToken, refreshToken } = await this.generateToken(input);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedResfreshToken(userId, hashedRefreshToken);
    return { accessToken, refreshToken, userId, username, expiresIn: jwtConstants.expireIn };
  }

  async validateRefreshToken(userId: string, token: string) {
    const user = await this.userService.getUser(userId);

    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException("Invalid refresh token");

    const refreshTokenMatches = await argon2.verify(user.hashedRefreshToken, token);
    if (!refreshTokenMatches) throw new UnauthorizedException("Invalid refresh token");

    return { id: userId, username: user.username };
  }

  async signOut(userId: string): Promise<void> {
    await this.userService.updateHashedResfreshToken(userId, null);
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new HttpException(
      getReasonPhrase(StatusCodes.NOT_FOUND),
      StatusCodes.NOT_FOUND
    );
    const currentUser: CurrentUser = { id: user.id, name: user.username, role: user.role };
    return currentUser; 
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.getUserByEmail(googleUser.email)
    if (user) return user;
    return await this.userService.create(googleUser);
  }
}
