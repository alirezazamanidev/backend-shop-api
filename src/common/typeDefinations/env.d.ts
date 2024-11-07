// src/types/env.d.ts

declare namespace NodeJS {
    interface ProcessEnv {
      // Application
      APP_NAME: string;
      APP_PORT: string;
      API_VERSION: string;
      OTP_TIME_EXPIRED: number;
      REFRESH_TOKEN_TIME_EXPIRED: number;
  
      // Admin Manager Info
      ADMIN_USERNAME: string;
      ADMIN_PASWORD: string;
  
      // Database (Postgres)
      DB_POSTGRES_HOST: string;
      DB_POSTGRES_PORT: number;
      DB_POSTGRES_PASSWORD: string;
      DB_POSTGRES_USERNAME: string;
      DB_POSTGRES_NAME: string;
  
      // Redis Database
      REDIS_PORT: number;
      REDIS_HOST: string;
  
      // Secrets for JWT
      ACCESS_TOKEN_JWT: string;
      REFRESH_TOKEN_JWT: string;
  
      // Secret for Session
      SECRET_SESSION_KEY: string;
      // Secrt for csrf
      CSRF_SECRET:string
      // S3 Storage
      S3_ACCESS_KEY: string;
      S3_SECRET_KEY: string;
      S3_ENDPOINT: string;
      S3_BUCKET_NAME: string;
    }
  }
  