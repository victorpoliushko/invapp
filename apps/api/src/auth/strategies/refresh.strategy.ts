import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "../constants";
import { Inject, Injectable } from "@nestjs/common";
import refreshJwtConfig from "src/config/refresh-jwt-config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refersh-jwt') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfiguration.secret
    });
  }

  async validate(payload: any) {
    return { id: payload.userId, username: payload.username };
  }
}
