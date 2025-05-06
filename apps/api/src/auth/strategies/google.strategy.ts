import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Role } from "@prisma/client";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY) 
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ["email", "profile"]
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    console.log("aaaa");
    console.log({ profile });
    // const user = await this.authService.validateGoogleUser({
    //     username: profile.name.givenName,
    //     email: profile.emails[0].value,
    //     role: Role.USER,
    //     password: ""
    // });
    // done(null ,user);
  }
}
