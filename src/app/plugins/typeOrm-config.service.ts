import { Injectable } from "@nestjs/common";

import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';


@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory{

    createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
        return {
          type: 'postgres',
          host: process.env.DB_POSTGRES_HOST,
          port:process.env.DB_POSTGRES_PORT,
          username: process.env.DB_POSTGRES_USERNAME,
          password: process.env.DB_POSTGRES_PASSWORD,
          database: process.env.DB_POSTGRES_NAME,
          entities: ['dist/src/modules/**/*.entity.{js,ts}'],
          synchronize: true,
          migrations: ['dist/database/migrations/*.{ts,js}'],
        };
      }
}