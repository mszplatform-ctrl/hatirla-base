import type { PrismaConfig } from "@prisma/config";

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
      provider: "postgresql",
    },
  },
  schema: "./schema.prisma",
} satisfies PrismaConfig;
