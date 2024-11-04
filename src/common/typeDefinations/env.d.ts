declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    // App
    APP_NAME: string;
    APP_PORT: number;
    API_VERSION: string;

    // Database
    DB_POSTGRES_HOST: string;
    DB_POSTGRES_PORT: number;
    DB_POSTGRES_PASSWORD: string;
    DB_POSTGRES_USERNAME: string;
    DB_POSTGRES_NAME: string;
  }
}
