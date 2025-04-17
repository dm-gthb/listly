import type { Config } from 'drizzle-kit';

export default {
  out: './drizzle/migrations',
  schema: './drizzle/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: '36bb15f8-6556-4f9c-a277-814433f95620',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config;
