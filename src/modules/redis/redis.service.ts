import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  onModuleInit() {
    this.redis = new Redis({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  // متد برای ذخیره داده با کلید و مقدار مشخص
  async set(key: string, value: string, expireInSeconds?: number): Promise<string> {
    if (expireInSeconds) {
      return await this.redis.set(key, value, 'EX', expireInSeconds);
    }
    return await this.redis.set(key, value);
  }

  // متد برای حذف داده با کلید مشخص
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }
  onModuleDestroy() {
    this.redis.quit().then(() => {
        console.log('Redis connection closed');
      }).catch((error) => {
        console.error('Error closing Redis connection:', error);
      });
  }
}
