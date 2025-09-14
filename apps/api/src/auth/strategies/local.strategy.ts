import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authServece: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (!password)
      throw new HttpException(
        getReasonPhrase('Please provide the password'),
        StatusCodes.UNAUTHORIZED,
      );
    const user = await this.authServece.validateUser({ username, password });
    console.log('user: ', user)

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: user.userId, username: user.username };
  }
}
