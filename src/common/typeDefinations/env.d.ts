declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    // App
    APP_NAME: string;
    APP_PORT: number;
    API_VERSION: string;
    OTP_TIME_EXPIRED:number
    // Database
    DB_POSTGRES_HOST: string;
    DB_POSTGRES_PORT: number;
    DB_POSTGRES_PASSWORD: string;
    DB_POSTGRES_USERNAME: string;
    DB_POSTGRES_NAME: string;
    // Redis
    REDIS_PORT: number;
    REDIS_HOST: string;
    // Secrets
    REFRESH_TOKEN_JWT:string
    ACCESS_TOKEN_JWT:string
    REFRESH_TOKEN_TIME_EXPIRED:number
  }
}
