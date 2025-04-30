import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY) private googleConfiguration: ConfigType<typeof googleOauthConfig>
  ) {
    super({
      clientId: googleConfiguration.clientId,
      clientSecret: googleConfiguration.clientSecret,
      callbackUrl: googleConfiguration.callbackUrl,
      scope: ["email", "profile"]
    })
  }
}
