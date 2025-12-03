import type { PrismaConfig } from "@prisma/config";

export default {
  datasources: {
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL!,
    },
  },
  schema: "./schema.prisma",
} satisfies PrismaConfig;
