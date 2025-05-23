import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "../constants";
import { Inject, Injectable } from "@nestjs/common";
import refreshJwtConfig from "src/config/refresh-jwt-config";
import { ConfigType } from "@nestjs/config";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfiguration.secret,
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get("authorization").replace("Bearer", "").trim();
    const userId = payload.userId;
    return await this.authService.validateRefreshToken(userId, refreshToken);
  }
}
