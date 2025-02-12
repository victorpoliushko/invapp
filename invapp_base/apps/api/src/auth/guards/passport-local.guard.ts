import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// user for the first time log in
@Injectable()
export class PassportLocalGuard extends AuthGuard('local') {}
