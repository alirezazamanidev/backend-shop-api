import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AtPayload } from '../types/payload.type';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { isJWT } from 'class-validator';
import { Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class AtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req?.cookies) {
            token = req.cookies.access_token;
          }
          if (req && req.headers) {
            token = this.extractHeaders(req);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_JWT,
    });
  }

  private extractHeaders(req: Request) {
    let [bearer, token] = req.headers?.authorization?.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token || !isJWT(token))
      throw new UnauthorizedException('Access token is not Valid!');
    return token;
  }
  async validate(payload: AtPayload) {
    let { phone } = payload;
    return await this.authService.getPaylodUser(phone);
  }
}
