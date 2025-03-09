import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../../customDecorators/has-permission.decorator";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

@Injectable()
export class HasPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    const requiredPermision = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler()
    );

    if (!requiredPermision) {
      return true;
    }

    const includesPermision = user.permissions.includes(requiredPermision);
    if (!user || !includesPermision) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      )
    }

    return true;
  }
}
