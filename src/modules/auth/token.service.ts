import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types/payload.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWTTokens(phone: string): Promise<Tokens> {
    let [at, rt] = await Promise.all([
      this.jwtService.sign(
        { phone },
        { secret: process.env.ACCESS_TOKEN_JWT, expiresIn: '5m' },
      ),
      this.jwtService.sign(
        { phone },
        { secret: process.env.REFRESH_TOKEN_JWT, expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
   verifyRt(rt:string){
    try {
      return this.jwtService.verify(rt, {
          secret: process.env.REFRESH_TOKEN_JWT,
        });
      } catch (err) {
        throw new UnauthorizedException("Invalid refresh token");
      }

  }
}
