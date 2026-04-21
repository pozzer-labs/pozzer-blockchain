declare global {
  interface Env {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    EMAILS: any;
    API_KEY: string;
    ADMIN_JWT_SECRET: string;
    AUTHORIZED_ADMIN_EMAILS: string;
    HCAPTCHA_SECRET_KEY: string;
    TESTNET_UNLOCK_DATE: string;
    TESTNET_EARLY_ACCESS_PASSWORD: string;
  }
}

export {};
