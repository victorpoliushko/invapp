// deprecated: passport handles the JWT

// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}

//   async canActivate(
//     context: ExecutionContext,
//   ): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);

//     if (!token) {
//       throw new UnauthorizedException();
//     }
    
//     try {
//       const tokenPayload = await this.jwtService.verifyAsync(token);
//       request.user = {
//         userId: tokenPayload.sub,
//         username: tokenPayload.username
//       }
      
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException();
//     }
//   }

//   private extractTokenFromHeader(request: any) {
//     const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }
